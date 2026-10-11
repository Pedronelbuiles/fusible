import { DUENO } from '../App'
import { corto } from '../dominio'

/**
 * Paso 1 del flujo: el dueño del presupuesto se identifica.
 * En el MVP esto lo resuelve Freighter; aquí la conexión es simulada.
 */
export default function Conectar({ onConectar }: { onConectar: () => void }) {
  return (
    <section className="tarjeta centrada">
      <span className="paso">Paso 1 de 4</span>
      <h2>Conecta tu billetera</h2>
      <p className="ayuda">
        Fusible no guarda llaves. Cada acción sobre el presupuesto la firmas
        tú desde tu propia billetera.
      </p>
      <button className="boton primario" onClick={onConectar}>
        Conectar billetera
      </button>
      <p className="nota">
        Conexión simulada para esta demostración. Se identificará como{' '}
        <code>{corto(DUENO)}</code>
      </p>
    </section>
  )
}
