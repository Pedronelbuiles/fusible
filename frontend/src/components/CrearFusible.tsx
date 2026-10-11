import { useState } from 'react'
import { AGENTE, DESTINOS } from '../App'
import type { Fusible } from '../dominio'
import { corto } from '../dominio'

/**
 * Pasos 2 y 3 del flujo: definir el límite y depositar el presupuesto.
 * Una vez creado, los montos y la lista de destinos no se pueden modificar:
 * esa es la regla que hace del límite una regla y no una promesa.
 */
export default function CrearFusible({
  onCrear,
}: {
  onCrear: (f: Fusible) => void
}) {
  const [topeTotal, setTopeTotal] = useState('10')
  const [topePorOperacion, setTopePorOperacion] = useState('1.5')
  const [horas, setHoras] = useState('72')
  const [elegidos, setElegidos] = useState<string[]>(
    DESTINOS.map((d) => d.direccion),
  )

  const alternar = (direccion: string) =>
    setElegidos((prev) =>
      prev.includes(direccion)
        ? prev.filter((d) => d !== direccion)
        : [...prev, direccion],
    )

  const total = Number(topeTotal)
  const porOperacion = Number(topePorOperacion)
  const valido =
    total > 0 && porOperacion > 0 && porOperacion <= total && elegidos.length > 0

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    onCrear({
      agente: AGENTE,
      topeTotal: total,
      topePorOperacion: porOperacion,
      destinos: DESTINOS.filter((d) => elegidos.includes(d.direccion)),
      vigenciaHasta: Date.now() + Number(horas) * 3600_000,
      fondeado: total,
      gastado: 0,
      estado: 'activo',
    })
  }

  return (
    <section className="tarjeta">
      <span className="paso">Pasos 2 y 3 de 4</span>
      <h2>Define el límite</h2>
      <p className="ayuda">
        Esto es lo que el agente no va a poder exceder. Una vez creado, nadie
        puede cambiarlo: tampoco tú.
      </p>

      <form onSubmit={enviar}>
        <div className="campos">
          <label>
            Tope total
            <div className="monto">
              <input
                type="number"
                min="0"
                step="0.01"
                value={topeTotal}
                onChange={(e) => setTopeTotal(e.target.value)}
              />
              <span>USDC</span>
            </div>
            <small>La pérdida máxima posible</small>
          </label>

          <label>
            Tope por operación
            <div className="monto">
              <input
                type="number"
                min="0"
                step="0.01"
                value={topePorOperacion}
                onChange={(e) => setTopePorOperacion(e.target.value)}
              />
              <span>USDC</span>
            </div>
            <small>Lo máximo en un solo pago</small>
          </label>

          <label>
            Vigencia
            <div className="monto">
              <input
                type="number"
                min="1"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
              />
              <span>horas</span>
            </div>
            <small>Después de esto no paga más</small>
          </label>
        </div>

        <fieldset className="destinos">
          <legend>Destinos permitidos</legend>
          <p className="ayuda">
            El agente solo podrá pagarle a quien esté marcado aquí. Cualquier
            otra dirección se rechaza, aunque quede saldo.
          </p>
          {DESTINOS.map((d) => (
            <label key={d.direccion} className="destino">
              <input
                type="checkbox"
                checked={elegidos.includes(d.direccion)}
                onChange={() => alternar(d.direccion)}
              />
              <span className="alias">{d.alias}</span>
              <code>{corto(d.direccion)}</code>
            </label>
          ))}
        </fieldset>

        <div className="agente-ref">
          Agente autorizado <code>{corto(AGENTE)}</code>
        </div>

        <button className="boton primario" type="submit" disabled={!valido}>
          Crear el fusible y depositar {topeTotal || '0'} USDC
        </button>
        {!valido && (
          <p className="nota error">
            Revisa los montos: el tope por operación no puede superar el total,
            y debe haber al menos un destino permitido.
          </p>
        )}
      </form>
    </section>
  )
}
