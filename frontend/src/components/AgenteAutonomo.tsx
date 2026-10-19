import { useRef, useState } from 'react'
import { DESTINOS } from '../stellar/config'
import { type ErrorContrato, pagar } from '../stellar/contrato'
import { aStroops } from '../stellar/config'
import { money } from '../dominio'

/**
 * Un agente que trabaja solo.
 *
 * El punto de esta pantalla es que **el agente no sabe cuándo parar**. No
 * consulta el saldo, no lleva la cuenta, no tiene lógica de freno: pide y
 * pide hasta que algo se lo impide. Lo que lo detiene es el contrato.
 *
 * Por eso el bucle no comprueba el presupuesto antes de pagar — esa
 * comprobación es justamente lo que estamos demostrando que no hace falta
 * confiarle al agente.
 */

/** Lo que el agente cree que está haciendo. Cada paso cuesta un pago. */
const TAREA = [
  'Leyendo el expediente',
  'Extrayendo las cláusulas',
  'Comparando con la plantilla',
  'Buscando precedentes',
  'Resumiendo hallazgos',
  'Redactando el informe',
  'Revisando el informe',
  'Archivando el resultado',
]

type Estado = 'quieto' | 'trabajando' | 'detenido' | 'terminado'

interface Resultado {
  paso: string
  ok: boolean
  motivo?: string
}

export default function AgenteAutonomo({
  idFusible,
  costePorPaso,
  bloqueado,
  onPagoHecho,
}: {
  idFusible: number
  costePorPaso: number
  bloqueado: boolean
  onPagoHecho: () => void | Promise<void>
}) {
  const [estado, setEstado] = useState<Estado>('quieto')
  const [hechos, setHechos] = useState<Resultado[]>([])
  const [motivoParada, setMotivoParada] = useState<string | null>(null)
  const detener = useRef(false)

  const trabajar = async () => {
    detener.current = false
    setHechos([])
    setMotivoParada(null)
    setEstado('trabajando')

    for (const paso of TAREA) {
      if (detener.current) {
        setMotivoParada('Lo detuviste tú.')
        setEstado('detenido')
        return
      }

      try {
        // Sin comprobar nada antes: el agente simplemente paga.
        await pagar(idFusible, DESTINOS[0].direccion, aStroops(costePorPaso))
        setHechos((h) => [...h, { paso, ok: true }])
        await onPagoHecho()
      } catch (e) {
        const motivo = (e as ErrorContrato).message
        setHechos((h) => [...h, { paso, ok: false, motivo }])
        setMotivoParada(motivo)
        setEstado('detenido')
        return
      }
    }

    setEstado('terminado')
  }

  const trabajando = estado === 'trabajando'
  const completados = hechos.filter((h) => h.ok).length
  const gastado = completados * costePorPaso

  return (
    <section className="tarjeta agente-auto" data-tour="autonomo">
      <div className="fila-titulo">
        <h2>Suéltalo a trabajar</h2>
        {trabajando && <span className="estado activo">en marcha</span>}
      </div>

      <p className="ayuda">
        El agente tiene una tarea de {TAREA.length} pasos y paga{' '}
        {money(costePorPaso)} XLM por cada uno. <strong>No comprueba su
        saldo ni sabe cuándo parar</strong>: pide hasta que algo se lo impida.
        Nadie tiene que estar mirando.
      </p>

      {estado === 'quieto' && (
        <button className="boton primario" disabled={bloqueado} onClick={() => void trabajar()}>
          Ponerlo a trabajar
        </button>
      )}

      {trabajando && (
        <button className="boton peligro" onClick={() => (detener.current = true)}>
          Detenerlo yo
          <small>Para demostrar que el corte del contrato no hace falta</small>
        </button>
      )}

      {(trabajando || hechos.length > 0) && (
        <ol className="tarea">
          {TAREA.map((p, i) => {
            const r = hechos[i]
            const actual = trabajando && i === hechos.length
            return (
              <li
                key={p}
                className={r ? (r.ok ? 'hecho' : 'frenado') : actual ? 'activo' : 'pendiente'}
              >
                <span className="marca" aria-hidden="true">
                  {r ? (r.ok ? '✓' : '×') : actual ? '•' : ''}
                </span>
                <span className="que">{p}</span>
                {r?.motivo && <span className="porque">{r.motivo}</span>}
              </li>
            )
          })}
        </ol>
      )}

      {estado === 'detenido' && (
        <p className="veredicto frenado">
          <strong>El agente se detuvo tras {completados} de {TAREA.length} pasos.</strong>{' '}
          {motivoParada} Gastó {money(gastado)} XLM y ni un stroop más. No
          tuvo que decidirlo él.
        </p>
      )}

      {estado === 'terminado' && (
        <p className="veredicto ok">
          <strong>Terminó la tarea completa</strong> dentro del presupuesto:{' '}
          {money(gastado)} XLM en {completados} pasos.
        </p>
      )}

      {(estado === 'detenido' || estado === 'terminado') && (
        <button className="boton fantasma" onClick={() => setEstado('quieto')}>
          Volver a empezar
        </button>
      )}
    </section>
  )
}
