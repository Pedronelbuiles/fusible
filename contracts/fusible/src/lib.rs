#![no_std]
//! Fusible: presupuestos con reglas para agentes autónomos.
//!
//! Un mismo contrato administra muchos fusibles. Cada uno lo crea su dueño
//! fijando el tope total, el tope por operación, la lista de destinos
//! permitidos y la ventana de vigencia. A partir de ahí nadie puede cambiar
//! esas reglas, tampoco él.
//!
//! El orden de validación de `pay` es el mismo que el de
//! `frontend/src/dominio.ts`, a propósito: la interfaz no debe prometer algo
//! distinto de lo que la red va a hacer.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

/// ~5 s por ledger. Se usa para decidir cuánto extender la vida de los datos.
const LEDGERS_POR_DIA: u32 = 17_280;
/// Si a un fusible le quedan menos de 30 días de vida, se le extiende.
const TTL_UMBRAL: u32 = LEDGERS_POR_DIA * 30;
/// Cada extensión lo lleva a 90 días.
const TTL_EXTENSION: u32 = LEDGERS_POR_DIA * 90;

#[contracttype]
pub enum DataKey {
    /// Cuántos fusibles se han creado. Vive con el contrato.
    Contador,
    /// Un fusible. Persistente: su estado no se puede recrear.
    Fuse(u32),
    /// Los fusibles de un dueño, para poder listarlos sin recorrer todo.
    DelDueno(Address),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Fusible {
    pub id: u32,
    pub owner: Address,
    pub agent: Address,
    pub token: Address,
    pub tope_total: i128,
    pub tope_por_op: i128,
    pub destinos: Vec<Address>,
    pub vigencia_hasta: u64,
    pub fondeado: i128,
    pub gastado: i128,
    pub cortado: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// No existe un fusible con ese identificador.
    NoExiste = 1,
    /// Quien llama no es el dueño de este fusible.
    NoEsElDueno = 2,
    ParametrosInvalidos = 3,
    /// El dueño cortó el fusible. Es definitivo.
    FusibleCortado = 4,
    /// La ventana de vigencia ya venció.
    FueraDeVigencia = 5,
    /// El destino no está en la lista fijada al crear el fusible.
    DestinoNoAutorizado = 6,
    /// El monto supera el máximo permitido en una sola operación.
    ExcedeTopePorOperacion = 7,
    /// El monto haría superar el tope total acumulado.
    ExcedeTopeTotal = 8,
    MontoInvalido = 9,
    SinRemanente = 10,
}

fn cargar(env: &Env, id: u32) -> Result<Fusible, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Fuse(id))
        .ok_or(Error::NoExiste)
}

/// Agrega el fusible al índice de su dueño. Solo se llama al crearlo.
fn indexar(env: &Env, owner: &Address, id: u32) {
    let k = DataKey::DelDueno(owner.clone());
    let mut lista: Vec<u32> = env
        .storage()
        .persistent()
        .get(&k)
        .unwrap_or_else(|| Vec::new(env));
    lista.push_back(id);
    env.storage().persistent().set(&k, &lista);
    env.storage()
        .persistent()
        .extend_ttl(&k, TTL_UMBRAL, TTL_EXTENSION);
}

fn guardar(env: &Env, f: &Fusible) {
    let k = DataKey::Fuse(f.id);
    env.storage().persistent().set(&k, f);
    env.storage()
        .persistent()
        .extend_ttl(&k, TTL_UMBRAL, TTL_EXTENSION);
}

#[contract]
pub struct FusibleContract;

#[contractimpl]
impl FusibleContract {
    /// Crea un fusible y devuelve su identificador. Los montos y la lista de
    /// destinos quedan fijos: no hay ninguna función que los modifique.
    pub fn create_fuse(
        env: Env,
        owner: Address,
        agent: Address,
        token: Address,
        tope_total: i128,
        tope_por_op: i128,
        destinos: Vec<Address>,
        vigencia_hasta: u64,
    ) -> Result<u32, Error> {
        owner.require_auth();

        if tope_total <= 0
            || tope_por_op <= 0
            || tope_por_op > tope_total
            || destinos.is_empty()
            || vigencia_hasta <= env.ledger().timestamp()
        {
            return Err(Error::ParametrosInvalidos);
        }

        let id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Contador)
            .unwrap_or(0u32)
            + 1;
        env.storage().instance().set(&DataKey::Contador, &id);
        env.storage()
            .instance()
            .extend_ttl(TTL_UMBRAL, TTL_EXTENSION);

        let f = Fusible {
            id,
            owner: owner.clone(),
            agent: agent.clone(),
            token,
            tope_total,
            tope_por_op,
            destinos,
            vigencia_hasta,
            fondeado: 0,
            gastado: 0,
            cortado: false,
        };
        guardar(&env, &f);
        indexar(&env, &owner, id);

        env.events()
            .publish((symbol_short!("creado"), owner, agent), (id, tope_total));
        Ok(id)
    }

    /// El dueño deposita el presupuesto del fusible.
    pub fn fund(env: Env, id: u32, amount: i128) -> Result<i128, Error> {
        let mut f = cargar(&env, id)?;
        f.owner.require_auth();

        if amount <= 0 {
            return Err(Error::MontoInvalido);
        }

        token::Client::new(&env, &f.token).transfer(
            &f.owner,
            &env.current_contract_address(),
            &amount,
        );

        f.fondeado += amount;
        guardar(&env, &f);

        env.events()
            .publish((symbol_short!("fondeado"), id), amount);
        Ok(f.fondeado)
    }

    /// El agente paga a un destino. Valida contra TODAS las reglas antes de
    /// mover un solo stroop. Si alguna falla, la transacción revierte y el
    /// error queda con su código.
    pub fn pay(env: Env, id: u32, to: Address, amount: i128) -> Result<i128, Error> {
        let mut f = cargar(&env, id)?;
        f.agent.require_auth();

        if amount <= 0 {
            return Err(Error::MontoInvalido);
        }
        if f.cortado {
            return Err(Error::FusibleCortado);
        }
        if env.ledger().timestamp() > f.vigencia_hasta {
            return Err(Error::FueraDeVigencia);
        }
        if !f.destinos.iter().any(|d| d == to) {
            return Err(Error::DestinoNoAutorizado);
        }
        if amount > f.tope_por_op {
            return Err(Error::ExcedeTopePorOperacion);
        }
        if f.gastado + amount > f.tope_total {
            return Err(Error::ExcedeTopeTotal);
        }

        token::Client::new(&env, &f.token).transfer(&env.current_contract_address(), &to, &amount);

        f.gastado += amount;
        guardar(&env, &f);

        env.events()
            .publish((symbol_short!("pago"), id, to), (amount, f.gastado));
        Ok(f.gastado)
    }

    /// Corte en caliente. Solo el dueño, y es irreversible.
    pub fn revoke(env: Env, id: u32) -> Result<(), Error> {
        let mut f = cargar(&env, id)?;
        f.owner.require_auth();

        if f.cortado {
            return Err(Error::FusibleCortado);
        }
        f.cortado = true;
        guardar(&env, &f);

        env.events()
            .publish((symbol_short!("cortado"), id), f.gastado);
        Ok(())
    }

    /// Devuelve al dueño lo que quedó sin gastar.
    pub fn sweep(env: Env, id: u32) -> Result<i128, Error> {
        let mut f = cargar(&env, id)?;
        f.owner.require_auth();

        let remanente = f.fondeado - f.gastado;
        if remanente <= 0 {
            return Err(Error::SinRemanente);
        }

        token::Client::new(&env, &f.token).transfer(
            &env.current_contract_address(),
            &f.owner,
            &remanente,
        );

        f.fondeado -= remanente;
        guardar(&env, &f);

        env.events()
            .publish((symbol_short!("retiro"), id), remanente);
        Ok(remanente)
    }

    // ---- lecturas: gratis, no exigen firma ----

    pub fn estado(env: Env, id: u32) -> Result<Fusible, Error> {
        cargar(&env, id)
    }

    pub fn disponible(env: Env, id: u32) -> Result<i128, Error> {
        let f = cargar(&env, id)?;
        Ok(f.tope_total - f.gastado)
    }

    /// Los identificadores de los fusibles de un dueño, del más viejo al más
    /// nuevo. Vacío si esa dirección nunca creó ninguno.
    pub fn de_dueno(env: Env, owner: Address) -> Vec<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::DelDueno(owner))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Cuántos fusibles se han creado. El último creado tiene este id.
    pub fn total(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Contador)
            .unwrap_or(0u32)
    }
}

mod test;
