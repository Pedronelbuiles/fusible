import { DESTINOS, DESTINO_HOSTIL } from '../App'
import type { Destino, Fusible } from '../dominio'
import { money } from '../dominio'

/**
 * No es parte del producto: es el agente de demostración.
 * Permite provocar los dos escenarios del MVP — el corte por tope y el
 * intento de pago a un destino no autorizado — sin esperar a que ocurran.
 */
export default function ConsolaAgente({
  fusible,
  corriendo,
  onPagar,
  onCorriendo,
}: {
  fusible: Fusible
  corriendo: boolean
  onPagar: (monto: number, destino: Destino) => void
  onCorriendo: (v: boolean) => void
}) {
  const inactivo = fusible.estado === 'cortado'
  const excesivo = Number((fusible.topePorOperacion + 0.5).toFixed(2))

  return (
    <section className="tarjeta consola">
      <h2>Agente de demostración</h2>
      <p className="ayuda">
        Simula el programa que trabaja solo. Cada botón es un intento de pago
        contra el fusible.
      </p>

      <div className="botones">
        <button
          className="boton"
          disabled={inactivo}
          onClick={() => onPagar(0.5, DESTINOS[0])}
        >
          Pagar 0.50 a {DESTINOS[0].alias}
          <small>Dentro de las reglas: debería pasar</small>
        </button>

        <button
          className="boton"
          disabled={inactivo}
          onClick={() => onPagar(excesivo, DESTINOS[1])}
        >
          Pagar {money(excesivo)} a {DESTINOS[1].alias}
          <small>Supera el tope por operación: debería rechazarse</small>
        </button>

        <button
          className="boton"
          disabled={inactivo}
          onClick={() => onPagar(0.5, DESTINO_HOSTIL)}
        >
          Pagar 0.50 a una dirección desconocida
          <small>Destino fuera de la lista: debería rechazarse</small>
        </button>

        <button
          className={`boton ${corriendo ? 'peligro' : 'primario'}`}
          disabled={inactivo}
          onClick={() => onCorriendo(!corriendo)}
        >
          {corriendo ? 'Detener al agente' : 'Dejarlo corriendo solo'}
          <small>
            {corriendo
              ? 'Pagando cada 900 ms hasta que el fusible lo detenga'
              : 'Paga por su cuenta hasta agotar el tope'}
          </small>
        </button>
      </div>

      {corriendo && (
        <p className="nota corriendo">
          El agente está gastando sin supervisión. Nadie tiene que mirar: el
          fusible lo detiene solo al llegar al tope.
        </p>
      )}
    </section>
  )
}
