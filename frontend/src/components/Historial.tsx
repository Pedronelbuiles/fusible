import type { Evento } from '../dominio'
import { MOTIVOS, hora, money } from '../dominio'

/**
 * El registro. En el MVP estas filas son eventos emitidos por el contrato,
 * no datos de la aplicación: por eso el historial no se puede editar ni
 * borrar desde aquí.
 */
const ETIQUETAS: Record<Evento['tipo'], string> = {
  creado: 'Fusible creado',
  fondeado: 'Presupuesto depositado',
  pago: 'Pago ejecutado',
  bloqueado: 'Pago rechazado',
  cortado: 'Fusible cortado',
  retiro: 'Remanente retirado',
}

export default function Historial({ eventos }: { eventos: Evento[] }) {
  const pagos = eventos.filter((e) => e.tipo === 'pago').length
  const bloqueos = eventos.filter((e) => e.tipo === 'bloqueado').length

  return (
    <section className="tarjeta historial">
      <div className="fila-titulo">
        <h2>Registro</h2>
        <span className="resumen">
          {pagos} ejecutados · {bloqueos} rechazados
        </span>
      </div>
      <p className="ayuda">
        Cada línea es un evento del contrato. No lo escribe quien cobra, y no
        se puede alterar después.
      </p>

      <ol className="eventos">
        {eventos.map((e) => (
          <li key={e.id} className={e.tipo}>
            <span className="hora">{hora(e.momento)}</span>
            <div className="cuerpo">
              <strong>{ETIQUETAS[e.tipo]}</strong>
              {e.monto !== undefined && (
                <span className="monto-ev">{money(e.monto)} USDC</span>
              )}
              {e.destino && <span className="destino-ev">→ {e.destino}</span>}
              {e.motivo && <p className="motivo">{MOTIVOS[e.motivo]}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
