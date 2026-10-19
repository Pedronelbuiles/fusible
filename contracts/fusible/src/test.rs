#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{vec, Address, Env};

/// Monta un fusible de 1000 con tope de 150 por operación y dos destinos
/// permitidos, ya fondeado. Devuelve el cliente y las piezas que hacen falta.
struct Caso<'a> {
    env: Env,
    cliente: FusibleContractClient<'a>,
    permitido: Address,
    ajeno: Address,
}

fn montar() -> Caso<'static> {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let permitido = Address::generate(&env);
    let otro_permitido = Address::generate(&env);
    let ajeno = Address::generate(&env);

    // Token de prueba, con el dueño del fusible como emisor.
    let sac = env.register_stellar_asset_contract_v2(owner.clone());
    let token_id = sac.address();
    token::StellarAssetClient::new(&env, &token_id).mint(&owner, &10_000);

    let id = env.register(FusibleContract, ());
    let cliente = FusibleContractClient::new(&env, &id);

    cliente.init(
        &owner,
        &agent,
        &token_id,
        &1_000,
        &150,
        &vec![&env, permitido.clone(), otro_permitido],
        &(env.ledger().timestamp() + 86_400),
    );
    cliente.fund(&1_000);

    Caso {
        env,
        cliente,
        permitido,
        ajeno,
    }
}

#[test]
fn fondear_registra_el_presupuesto() {
    let c = montar();
    let f = c.cliente.estado();
    assert_eq!(f.fondeado, 1_000);
    assert_eq!(f.gastado, 0);
    assert_eq!(c.cliente.disponible(), 1_000);
}

#[test]
fn pago_dentro_de_las_reglas_pasa() {
    let c = montar();
    assert_eq!(c.cliente.pay(&c.permitido, &100), 100);
    assert_eq!(c.cliente.gastado(), 100);
    assert_eq!(c.cliente.disponible(), 900);
}

#[test]
fn rechaza_monto_sobre_el_tope_por_operacion() {
    let c = montar();
    let r = c.cliente.try_pay(&c.permitido, &151);
    assert_eq!(r, Err(Ok(Error::ExcedeTopePorOperacion)));
    // Nada se movió.
    assert_eq!(c.cliente.gastado(), 0);
}

#[test]
fn rechaza_destino_fuera_de_la_lista() {
    let c = montar();
    // Monto que sí cabía: se rechaza solo por el destino.
    let r = c.cliente.try_pay(&c.ajeno, &10);
    assert_eq!(r, Err(Ok(Error::DestinoNoAutorizado)));
    assert_eq!(c.cliente.gastado(), 0);
}

#[test]
fn el_tope_total_detiene_solo() {
    let c = montar();
    // 1000 / 150 -> seis pagos de 150 (900) y el séptimo no cabe completo.
    for _ in 0..6 {
        c.cliente.pay(&c.permitido, &150);
    }
    assert_eq!(c.cliente.gastado(), 900);

    // 150 haría 1050: se rechaza.
    let r = c.cliente.try_pay(&c.permitido, &150);
    assert_eq!(r, Err(Ok(Error::ExcedeTopeTotal)));

    // Los 100 que sí caben, pasan.
    c.cliente.pay(&c.permitido, &100);
    assert_eq!(c.cliente.gastado(), 1_000);
    assert_eq!(c.cliente.disponible(), 0);

    // Y de ahí no pasa nada más.
    let r = c.cliente.try_pay(&c.permitido, &1);
    assert_eq!(r, Err(Ok(Error::ExcedeTopeTotal)));
}

#[test]
fn el_corte_es_inmediato_y_definitivo() {
    let c = montar();
    c.cliente.pay(&c.permitido, &100);
    c.cliente.revoke();

    assert!(c.cliente.estado().cortado);

    let r = c.cliente.try_pay(&c.permitido, &10);
    assert_eq!(r, Err(Ok(Error::FusibleCortado)));

    // No hay forma de reactivarlo: revocar de nuevo también falla.
    let r = c.cliente.try_revoke();
    assert_eq!(r, Err(Ok(Error::FusibleCortado)));
}

#[test]
fn vencida_la_ventana_no_paga_mas() {
    let c = montar();
    let vence = c.cliente.estado().vigencia_hasta;
    c.env.ledger().set_timestamp(vence + 1);

    let r = c.cliente.try_pay(&c.permitido, &10);
    assert_eq!(r, Err(Ok(Error::FueraDeVigencia)));
}

#[test]
fn el_remanente_vuelve_al_dueno() {
    let c = montar();
    c.cliente.pay(&c.permitido, &150);

    assert_eq!(c.cliente.sweep(), 850);
    assert_eq!(c.cliente.estado().fondeado, 150);

    // No se puede retirar dos veces.
    let r = c.cliente.try_sweep();
    assert_eq!(r, Err(Ok(Error::SinRemanente)));
}

#[test]
fn no_se_puede_inicializar_dos_veces() {
    let c = montar();
    let f = c.cliente.estado();
    let r = c.cliente.try_init(
        &f.owner,
        &f.agent,
        &f.token,
        &999_999,
        &999_999,
        &vec![&c.env, c.ajeno.clone()],
        &(c.env.ledger().timestamp() + 86_400),
    );
    assert_eq!(r, Err(Ok(Error::YaInicializado)));

    // Las reglas originales siguen intactas.
    assert_eq!(c.cliente.estado().tope_total, 1_000);
}
