import type { Fusible } from '../dominio'
import { corto, disponible, money, porcentajeUsado, remanente } from '../dominio'

/**
 * Paso 4 del flujo: el dueño ve el gasto mientras ocurre y puede cortar.
 * Toda la información se deriva del estado del fusible; no hay datos propios.
 */
export default function Panel({
  fusible,
  onCortar,
  onRetirar,
  onReiniciar,
}: {
  fusible: Fusible
  onCortar: () => void
  onRetirar: () => void
  onReiniciar: () => void
}) {
  const usado = porcentajeUsado(fusible)
  const cortado = fusible.estado === 'cortado'
  const vencido = Date.now() > fusible.vigenciaHasta
  const agotado = disponible(fusible) <= 0

  const estado = cortado
    ? { texto: 'Cortado', clase: 'cortado' }
    : vencido
      ? { texto: 'Vencido', clase: 'cortado' }
      : agotado
        ? { texto: 'Tope alcanzado', clase: 'agotado' }
        : { texto: 'Activo', clase: 'activo' }

  return (
    <section className="tarjeta">
      <div className="fila-titulo">
        <h2>Presupuesto del agente</h2>
        <span className={`estado ${estado.clase}`}>{estado.texto}</span>
      </div>

      <div className="medidor">
        <div className="cifras">
          <strong>{money(fusible.gastado)}</strong>
          <span>de {money(fusible.topeTotal)} USDC</span>
        </div>
        <div className="barra" role="progressbar" aria-valuenow={Math.round(usado)}>
          <div
            className={`relleno ${usado >= 100 ? 'lleno' : ''}`}
            style={{ width: `${usado}%` }}
          />
        </div>
        <small>
          Quedan {money(Math.max(0, disponible(fusible)))} USDC por gastar
        </small>
      </div>

      <dl className="datos">
        <div>
          <dt>Tope por operación</dt>
          <dd>{money(fusible.topePorOperacion)} USDC</dd>
        </div>
        <div>
          <dt>Destinos permitidos</dt>
          <dd>{fusible.destinos.length}</dd>
        </div>
        <div>
          <dt>Vence</dt>
          <dd>{new Date(fusible.vigenciaHasta).toLocaleString('es-CO')}</dd>
        </div>
        <div>
          <dt>Agente</dt>
          <dd>
            <code>{corto(fusible.agente)}</code>
          </dd>
        </div>
      </dl>

      <div className="acciones">
        <button
          className="boton peligro"
          onClick={onCortar}
          disabled={cortado}
        >
          Cortar ahora
        </button>
        <button
          className="boton"
          onClick={onRetirar}
          disabled={remanente(fusible) <= 0}
        >
          Retirar remanente ({money(Math.max(0, remanente(fusible)))} USDC)
        </button>
        <button className="boton fantasma" onClick={onReiniciar}>
          Empezar de nuevo
        </button>
      </div>

      {cortado && (
        <p className="nota">
          El corte es definitivo: el fusible no se puede reactivar. El
          remanente sigue disponible para retirar.
        </p>
      )}
    </section>
  )
}
