import type { EventoCadena } from '../stellar/contrato'
import { aUnidades, urlTx } from '../stellar/config'
import { corto, hora, money } from '../dominio'

/** Un rechazo de esta sesión. No existe en la red: la transacción revirtió. */
export interface Rechazo {
  id: number
  idFusible: number
  monto: number
  destino: string
  motivo: string
  momento: number
}

const ETIQUETA: Record<EventoCadena['tipo'], string> = {
  creado: 'Fusible creado',
  fondeado: 'Presupuesto depositado',
  pago: 'Pago ejecutado',
  cortado: 'Fusible cortado',
  retiro: 'Remanente retirado',
}

/**
 * El registro de un fusible. Mezcla dos cosas de naturaleza distinta y lo
 * dice: los eventos del contrato, que vienen de la red y sobreviven a
 * recargar, y los rechazos de esta sesión, que no dejaron rastro porque la
 * transacción revirtió antes de enviarse.
 */
export default function Registro({
  idFusible,
  eventos,
  rechazos,
  cargando,
}: {
  idFusible: number
  eventos: EventoCadena[]
  rechazos: Rechazo[]
  cargando: boolean
}) {
  const mios = rechazos.filter((r) => r.idFusible === idFusible)

  const filas = [
    ...eventos.map((e) => ({
      clave: `${e.hash}-${e.tipo}`,
      orden: e.ledger * 1000,
      tipo: e.tipo === 'pago' ? 'pago' : e.tipo === 'cortado' ? 'cortado' : 'creado',
      titulo: ETIQUETA[e.tipo],
      monto: e.monto !== undefined ? `${money(aUnidades(e.monto))} XLM` : null,
      detalle: e.destino ? `a ${corto(e.destino)}` : null,
      hash: e.hash,
      sello: `ledger ${e.ledger}`,
    })),
    ...mios.map((r) => ({
      clave: `r-${r.id}`,
      orden: r.momento,
      tipo: 'bloqueado',
      titulo: 'Pago rechazado',
      monto: `${money(r.monto)} XLM`,
      detalle: `${r.destino} — ${r.motivo}`,
      hash: null,
      sello: hora(r.momento),
    })),
  ].sort((a, b) => b.orden - a.orden)

  return (
    <section className="tarjeta historial" data-tour="registro">
      <div className="fila-titulo">
        <h2>Registro del fusible #{idFusible}</h2>
        {cargando && <span className="resumen">leyendo la red…</span>}
      </div>
      <p className="ayuda">
        Estas líneas son eventos del contrato, no de esta página: siguen ahí
        si recargas, y cualquiera puede leerlos sin pedirnos permiso. Los
        rechazos no aparecen en la red —la transacción revierte— así que solo
        se ven los de esta sesión.
      </p>

      {filas.length === 0 && !cargando && (
        <p className="vacio">
          No hay movimientos recientes en este fusible. El registro muestra
          las últimas horas: lo más antiguo deja de estar disponible en el
          RPC, aunque siga en la red.
        </p>
      )}

      <ol className="eventos">
        {filas.map((f) => (
          <li key={f.clave} className={f.tipo}>
            <span className="hora">{f.sello}</span>
            <div className="cuerpo">
              <strong>{f.titulo}</strong>
              {f.monto && <span className="monto-ev">{f.monto}</span>}
              {f.detalle && <p className="motivo">{f.detalle}</p>}
              {f.hash && (
                <a
                  className="destino-ev"
                  href={urlTx(f.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  ver en el explorador ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
