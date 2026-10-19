#![no_std]
//! Fusible: un presupuesto con reglas para un agente autónomo.
//!
//! Una instancia del contrato = un fusible. El dueño lo crea fijando el tope
//! total, el tope por operación, la lista de destinos permitidos y la ventana
//! de vigencia. A partir de ahí nadie puede cambiar esas reglas, tampoco él.
//!
//! El orden de validación de `pay` es el mismo que el de
//! `frontend/src/dominio.ts`, a propósito: la interfaz no debe prometer algo
//! distinto de lo que la red va a hacer.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

#[contracttype]
pub enum DataKey {
    Fusible,
}

#[contracttype]
#[derive(Clone)]
pub struct Fusible {
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
    YaInicializado = 1,
    NoInicializado = 2,
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

fn cargar(env: &Env) -> Result<Fusible, Error> {
    env.storage()
        .instance()
        .get(&DataKey::Fusible)
        .ok_or(Error::NoInicializado)
}

fn guardar(env: &Env, f: &Fusible) {
    env.storage().instance().set(&DataKey::Fusible, f);
}

#[contract]
pub struct FusibleContract;

#[contractimpl]
impl FusibleContract {
    /// Crea el fusible. Solo se puede llamar una vez: los montos y la lista
    /// de destinos quedan fijos para siempre.
    pub fn init(
        env: Env,
        owner: Address,
        agent: Address,
        token: Address,
        tope_total: i128,
        tope_por_op: i128,
        destinos: Vec<Address>,
        vigencia_hasta: u64,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Fusible) {
            return Err(Error::YaInicializado);
        }
        owner.require_auth();

        if tope_total <= 0
            || tope_por_op <= 0
            || tope_por_op > tope_total
            || destinos.is_empty()
            || vigencia_hasta <= env.ledger().timestamp()
        {
            return Err(Error::ParametrosInvalidos);
        }

        let f = Fusible {
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

        env.events()
            .publish((symbol_short!("creado"), owner, agent), tope_total);
        Ok(())
    }

    /// El dueño deposita el presupuesto en el contrato.
    pub fn fund(env: Env, amount: i128) -> Result<(), Error> {
        let mut f = cargar(&env)?;
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
            .publish((symbol_short!("fondeado"),), amount);
        Ok(())
    }

    /// El agente paga a un destino. Valida contra TODAS las reglas antes de
    /// mover un solo stroop. Si alguna falla, la transacción revierte y el
    /// error queda registrado en la red con su código.
    pub fn pay(env: Env, to: Address, amount: i128) -> Result<i128, Error> {
        let mut f = cargar(&env)?;
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

        token::Client::new(&env, &f.token).transfer(
            &env.current_contract_address(),
            &to,
            &amount,
        );

        f.gastado += amount;
        guardar(&env, &f);

        env.events()
            .publish((symbol_short!("pago"), to), (amount, f.gastado));
        Ok(f.gastado)
    }

    /// Corte en caliente. Solo el dueño, y es irreversible: no hay forma de
    /// reactivar un fusible cortado.
    pub fn revoke(env: Env) -> Result<(), Error> {
        let mut f = cargar(&env)?;
        f.owner.require_auth();

        if f.cortado {
            return Err(Error::FusibleCortado);
        }
        f.cortado = true;
        guardar(&env, &f);

        env.events()
            .publish((symbol_short!("cortado"),), f.gastado);
        Ok(())
    }

    /// Devuelve al dueño lo que quedó sin gastar.
    pub fn sweep(env: Env) -> Result<i128, Error> {
        let mut f = cargar(&env)?;
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
            .publish((symbol_short!("retiro"),), remanente);
        Ok(remanente)
    }

    // ---- lecturas: gratis, no exigen firma ----

    pub fn estado(env: Env) -> Result<Fusible, Error> {
        cargar(&env)
    }

    pub fn gastado(env: Env) -> Result<i128, Error> {
        Ok(cargar(&env)?.gastado)
    }

    /// Cuánto queda por gastar dentro del tope.
    pub fn disponible(env: Env) -> Result<i128, Error> {
        let f = cargar(&env)?;
        Ok(f.tope_total - f.gastado)
    }
}

mod test;
