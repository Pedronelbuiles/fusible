import { useState } from 'react'
import { ErrorFreighter, type Firmante, conectarFreighter } from '../stellar/firmante'
import { duenoDemo } from '../stellar/contrato'
import { ModalError } from './Modal'

/**
 * Puerta de entrada. Sin billetera conectada no se ve el panel: la dirección
 * que firma es la que decide qué fusibles son tuyos, así que no hay nada
 * sensato que mostrar antes de saberla.
 */
export default function Landing({ onEntrar }: { onEntrar: (f: Firmante) => void }) {
  const [fallo, setFallo] = useState<string | null>(null)
  const [conectando, setConectando] = useState(false)

  const conectar = async () => {
    setConectando(true)
    try {
      onEntrar(await conectarFreighter())
    } catch (e) {
      setFallo(e instanceof ErrorFreighter ? e.message : String(e))
    } finally {
      setConectando(false)
    }
  }

  return (
    <>
      <main className="landing">
        <section className="portada">
          <h2>
            Tu agente puede pagar.
            <br />
            <span>Ahora también puede parar.</span>
          </h2>

          <p className="entrada">
            Para que un programa autónomo pague por lo que consume hay que
            darle una credencial con un medio de pago detrás. Una credencial
            responde <em>quién eres</em>; nunca responde <em>hasta cuánto</em>.
          </p>

          <p className="entrada">
            Fusible es ese límite. Un contrato guarda el presupuesto y lo
            suelta solo si se cumplen las reglas que pusiste al crearlo — y
            esas reglas no las puede cambiar nadie después, tampoco tú.
          </p>

          <div className="acceso">
            <button
              className="boton primario"
              onClick={() => void conectar()}
              disabled={conectando}
            >
              {conectando ? 'Esperando a Freighter…' : 'Conectar mi billetera'}
            </button>
            <button className="boton" onClick={() => onEntrar(duenoDemo())}>
              Entrar en modo demostración
              <small>Sin instalar nada, con una cuenta de prueba compartida</small>
            </button>
          </div>

          <p className="pie-landing">
            Todo ocurre en la red de pruebas de Stellar. No hay dinero real en
            juego. ¿No tienes billetera?{' '}
            <a href="https://www.freighter.app" target="_blank" rel="noreferrer">
              Instalar Freighter ↗
            </a>
          </p>
        </section>

        <section className="reglas-portada">
          <h3>Las cuatro reglas</h3>
          <dl>
            <div>
              <dt>Tope total</dt>
              <dd>La pérdida máxima posible, decidida antes de empezar</dd>
            </div>
            <div>
              <dt>Tope por operación</dt>
              <dd>Lo máximo que puede salir en un solo pago</dd>
            </div>
            <div>
              <dt>Destinos permitidos</dt>
              <dd>Una lista cerrada. A cualquier otro, no se paga</dd>
            </div>
            <div>
              <dt>Vigencia</dt>
              <dd>Pasada la fecha, el fusible deja de pagar solo</dd>
            </div>
          </dl>
          <p className="corte">
            Y en cualquier momento, el corte: inmediato y definitivo.
          </p>
        </section>
      </main>

      {fallo && (
        <ModalError
          titulo="No se pudo conectar"
          mensaje={fallo}
          detalle="También puedes entrar en modo demostración y probarlo sin billetera."
          onCerrar={() => setFallo(null)}
        />
      )}
    </>
  )
}
