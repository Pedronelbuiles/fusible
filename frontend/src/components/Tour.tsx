import { useCallback, useEffect, useState } from 'react'

export interface PasoTour {
  /** Valor del atributo `data-tour` del elemento a señalar. */
  ancla: string
  titulo: string
  texto: string
}

const VISTO = 'fusible.tour.visto'

export const yaVioElTour = () => {
  try {
    return localStorage.getItem(VISTO) === '1'
  } catch {
    return false
  }
}

const marcarVisto = () => {
  try {
    localStorage.setItem(VISTO, '1')
  } catch {
    /* modo privado: que el tour vuelva a salir no rompe nada */
  }
}

interface Hueco {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Recorrido guiado. Recorta un hueco sobre el elemento señalado y explica
 * qué es. Salta los pasos cuyo elemento no esté en pantalla, para que sirva
 * igual antes y después de tener un fusible creado.
 */
export default function Tour({
  pasos,
  onCerrar,
}: {
  pasos: PasoTour[]
  onCerrar: () => void
}) {
  const [i, setI] = useState(0)
  const [hueco, setHueco] = useState<Hueco | null>(null)
  const [visibles, setVisibles] = useState<PasoTour[]>([])

  /**
   * Qué pasos tienen su elemento en pantalla.
   *
   * Esto NO se puede calcular durante el render: cuando el tour se monta a
   * la vez que la pantalla que va a explicar, el DOM todavía no tiene esos
   * elementos y la lista saldría vacía — el tour no aparecía hasta que algo
   * más provocaba un repintado. Se mide después del commit, y se reintenta
   * un segundo por si la pantalla tarda en montarse.
   */
  useEffect(() => {
    let vivo = true
    let intentos = 0

    const buscar = () => {
      if (!vivo) return
      const v = pasos.filter((p) => document.querySelector(`[data-tour="${p.ancla}"]`))
      if (v.length > 0) {
        setVisibles(v)
        return
      }
      // El panel puede tardar en montarse: lee el contrato primero.
      if (++intentos < 100) setTimeout(buscar, 150)
    }

    buscar()
    return () => {
      vivo = false
    }
  }, [pasos])

  const paso = visibles[i]

  const cerrar = useCallback(() => {
    marcarVisto()
    onCerrar()
  }, [onCerrar])

  const medir = useCallback(() => {
    if (!paso) return
    const el = document.querySelector(`[data-tour="${paso.ancla}"]`)
    if (!el) return setHueco(null)
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    // Tras el scroll suave, el rect cambia: se mide un instante después.
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      setHueco({ top: r.top, left: r.left, width: r.width, height: r.height })
    }, 320)
  }, [paso])

  useEffect(() => {
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [medir])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, visibles.length - 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [cerrar, visibles.length])

  // Aún midiendo, o esta pantalla no tiene nada que explicar.
  if (visibles.length === 0) return null
  if (!paso) {
    setI(0)
    return null
  }

  const ultimo = i === visibles.length - 1
  // El globo va debajo del hueco salvo que no quepa; entonces, encima.
  const abajo = hueco ? hueco.top + hueco.height + 190 < window.innerHeight : true

  return (
    <div className="tour" onClick={cerrar}>
      {hueco && (
        <div
          className="tour-hueco"
          style={{
            top: hueco.top - 6,
            left: hueco.left - 6,
            width: hueco.width + 12,
            height: hueco.height + 12,
          }}
        />
      )}

      <div
        className="tour-globo"
        onClick={(e) => e.stopPropagation()}
        style={
          hueco
            ? {
                top: abajo ? hueco.top + hueco.height + 16 : undefined,
                bottom: abajo ? undefined : window.innerHeight - hueco.top + 16,
                left: Math.max(16, Math.min(hueco.left, window.innerWidth - 360)),
              }
            : { top: '35%', left: '50%', transform: 'translateX(-50%)' }
        }
      >
        <span className="tour-cuenta">
          {i + 1} de {visibles.length}
        </span>
        <h4>{paso.titulo}</h4>
        <p>{paso.texto}</p>

        <div className="tour-botones">
          <button className="enlace" onClick={cerrar}>
            Saltar
          </button>
          <div>
            {i > 0 && (
              <button className="boton fantasma" onClick={() => setI(i - 1)}>
                Atrás
              </button>
            )}
            <button
              className="boton primario"
              onClick={() => (ultimo ? cerrar() : setI(i + 1))}
            >
              {ultimo ? 'Entendido' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Los pasos del recorrido. El orden importa. */
export const PASOS_TOUR: PasoTour[] = [
  {
    ancla: 'selector',
    titulo: 'Tus fusibles',
    texto:
      'Cada fusible es un presupuesto con sus propias reglas. Aquí cambias entre los que has creado con esta billetera, o creas uno nuevo.',
  },
  {
    ancla: 'formulario',
    titulo: 'Define el límite',
    texto:
      'Decides cuánto puede gastar en total, cuánto en un solo pago y a quién se le puede pagar. Una vez creado, estas reglas no las puede cambiar nadie — tampoco tú.',
  },
  {
    ancla: 'medidor',
    titulo: 'Cuánto lleva gastado',
    texto:
      'Esto se lee del contrato, no de esta página. Cuando la barra llega al final, el fusible deja de aprobar pagos sin que nadie intervenga.',
  },
  {
    ancla: 'acciones',
    titulo: 'Cortar y retirar',
    texto:
      'El corte es inmediato y definitivo: no hay forma de reactivar un fusible cortado. Lo que no se gastó vuelve a tu billetera cuando quieras.',
  },
  {
    ancla: 'autonomo',
    titulo: 'Suéltalo a trabajar',
    texto:
      'Aquí está el punto de todo: el agente tiene una tarea y paga por cada paso, pero no comprueba su saldo ni sabe cuándo parar. Quien lo detiene es el contrato, no él y no tú.',
  },
  {
    ancla: 'agente',
    titulo: 'Probar las reglas una a una',
    texto:
      'Simula el programa que trabaja solo. El primer botón hace un pago que cumple las reglas; los otros dos intentan saltárselas, para que veas al contrato rechazarlos.',
  },
  {
    ancla: 'registro',
    titulo: 'El registro',
    texto:
      'Cada operación deja un hash que cualquiera puede verificar en el explorador. No lo escribimos nosotros: son eventos del contrato, y siguen ahí si recargas la página.',
  },
]
