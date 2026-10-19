#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{vec, Address, Env};

/// Monta un fusible de 1000 con tope de 150 por operación y dos destinos
/// permitidos, ya fondeado.
struct Caso<'a> {
    env: Env,
    cliente: FusibleContractClient<'a>,
    id: u32,
    owner: Address,
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

    let sac = env.register_stellar_asset_contract_v2(owner.clone());
    let token_id = sac.address();
    token::StellarAssetClient::new(&env, &token_id).mint(&owner, &10_000);

    let contrato = env.register(FusibleContract, ());
    let cliente = FusibleContractClient::new(&env, &contrato);

    let id = cliente.create_fuse(
        &owner,
        &agent,
        &token_id,
        &1_000,
        &150,
        &vec![&env, permitido.clone(), otro_permitido],
        &(env.ledger().timestamp() + 86_400),
    );
    cliente.fund(&id, &1_000);

    Caso {
        env,
        cliente,
        id,
        owner,
        permitido,
        ajeno,
    }
}

#[test]
fn el_primer_fusible_tiene_id_uno() {
    let c = montar();
    assert_eq!(c.id, 1);
    assert_eq!(c.cliente.total(), 1);
}

#[test]
fn fondear_registra_el_presupuesto() {
    let c = montar();
    let f = c.cliente.estado(&c.id);
    assert_eq!(f.fondeado, 1_000);
    assert_eq!(f.gastado, 0);
    assert_eq!(c.cliente.disponible(&c.id), 1_000);
}

#[test]
fn pago_dentro_de_las_reglas_pasa() {
    let c = montar();
    assert_eq!(c.cliente.pay(&c.id, &c.permitido, &100), 100);
    assert_eq!(c.cliente.disponible(&c.id), 900);
}

#[test]
fn rechaza_monto_sobre_el_tope_por_operacion() {
    let c = montar();
    let r = c.cliente.try_pay(&c.id, &c.permitido, &151);
    assert_eq!(r, Err(Ok(Error::ExcedeTopePorOperacion)));
    assert_eq!(c.cliente.estado(&c.id).gastado, 0);
}

#[test]
fn rechaza_destino_fuera_de_la_lista() {
    let c = montar();
    // Monto que sí cabía: se rechaza solo por el destino.
    let r = c.cliente.try_pay(&c.id, &c.ajeno, &10);
    assert_eq!(r, Err(Ok(Error::DestinoNoAutorizado)));
    assert_eq!(c.cliente.estado(&c.id).gastado, 0);
}

#[test]
fn el_tope_total_detiene_solo() {
    let c = montar();
    for _ in 0..6 {
        c.cliente.pay(&c.id, &c.permitido, &150);
    }
    assert_eq!(c.cliente.estado(&c.id).gastado, 900);

    let r = c.cliente.try_pay(&c.id, &c.permitido, &150);
    assert_eq!(r, Err(Ok(Error::ExcedeTopeTotal)));

    c.cliente.pay(&c.id, &c.permitido, &100);
    assert_eq!(c.cliente.disponible(&c.id), 0);

    let r = c.cliente.try_pay(&c.id, &c.permitido, &1);
    assert_eq!(r, Err(Ok(Error::ExcedeTopeTotal)));
}

#[test]
fn el_corte_es_inmediato_y_definitivo() {
    let c = montar();
    c.cliente.pay(&c.id, &c.permitido, &100);
    c.cliente.revoke(&c.id);

    assert!(c.cliente.estado(&c.id).cortado);

    let r = c.cliente.try_pay(&c.id, &c.permitido, &10);
    assert_eq!(r, Err(Ok(Error::FusibleCortado)));

    // No hay forma de reactivarlo.
    let r = c.cliente.try_revoke(&c.id);
    assert_eq!(r, Err(Ok(Error::FusibleCortado)));
}

#[test]
fn vencida_la_ventana_no_paga_mas() {
    let c = montar();
    let vence = c.cliente.estado(&c.id).vigencia_hasta;
    c.env.ledger().set_timestamp(vence + 1);

    let r = c.cliente.try_pay(&c.id, &c.permitido, &10);
    assert_eq!(r, Err(Ok(Error::FueraDeVigencia)));
}

#[test]
fn el_remanente_vuelve_al_dueno() {
    let c = montar();
    c.cliente.pay(&c.id, &c.permitido, &150);

    assert_eq!(c.cliente.sweep(&c.id), 850);
    assert_eq!(c.cliente.estado(&c.id).fondeado, 150);

    let r = c.cliente.try_sweep(&c.id);
    assert_eq!(r, Err(Ok(Error::SinRemanente)));
}

#[test]
fn un_fusible_no_puede_gastar_del_otro() {
    let c = montar();

    // Segundo fusible, del mismo dueño, con su propio presupuesto.
    let agent2 = Address::generate(&c.env);
    let id2 = c.cliente.create_fuse(
        &c.owner,
        &agent2,
        &c.cliente.estado(&c.id).token,
        &500,
        &500,
        &vec![&c.env, c.permitido.clone()],
        &(c.env.ledger().timestamp() + 86_400),
    );
    c.cliente.fund(&id2, &500);
    assert_eq!(id2, 2);

    // Agotar el segundo no toca al primero.
    c.cliente.pay(&id2, &c.permitido, &500);
    assert_eq!(c.cliente.disponible(&id2), 0);
    assert_eq!(c.cliente.disponible(&c.id), 1_000);

    // Y el primero sigue pudiendo pagar.
    c.cliente.pay(&c.id, &c.permitido, &150);
    assert_eq!(c.cliente.estado(&c.id).gastado, 150);
}

#[test]
fn no_existe_un_fusible_sin_crear() {
    let c = montar();
    let r = c.cliente.try_estado(&999);
    assert_eq!(r, Err(Ok(Error::NoExiste)));
}
