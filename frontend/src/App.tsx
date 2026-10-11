import { useCallback, useEffect, useRef, useState } from 'react'
import type { Destino, Evento, Fusible, MotivoRechazo } from './dominio'
import { intentarPago } from './dominio'
import Encabezado from './components/Encabezado'
import Conectar from './components/Conectar'
import CrearFusible from './components/CrearFusible'
import Panel from './components/Panel'
import ConsolaAgente from './components/ConsolaAgente'
import Historial from './components/Historial'

const sufijo = 'K2MXQPL4RVZT6YH3NBWSD5FGJC7EUA9TKM2QRXV1BCDEFGHJKLMNPRS'
const dir = (prefijo: string) => (prefijo + sufijo).slice(0, 56)

export const DUENO = dir('GDUENO')
export const AGENTE = dir('GAGENTE')

export const DESTINOS: Destino[] = [
  { alias: 'Modelo de lenguaje', direccion: dir('GAMODELO') },
  { alias: 'Enriquecimiento de datos', direccion: dir('GADATOS') },
  { alias: 'Búsqueda web', direccion: dir('GABUSQUEDA') },
]

export const DESTINO_HOSTIL: Destino = {
  alias: 'Dirección desconocida',
  direccion: dir('GAXDESCONOCIDA'),
}

export default function App() {
  const [conectado, setConectado] = useState(false)
  const [fusible, setFusible] = useState<Fusible | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [corriendo, setCorriendo] = useState(false)
  const idRef = useRef(0)

  // Espejo del fusible para leer el valor vigente sin meter efectos dentro de
  // un updater de estado: React invoca los updaters más de una vez en
  // desarrollo, y registrar un evento ahí dentro duplicaría el historial.
  const fRef = useRef<Fusible | null>(null)
  useEffect(() => {
    fRef.current = fusible
  }, [fusible])

  const registrar = useCallback((e: Omit<Evento, 'id' | 'momento'>) => {
    idRef.current += 1
    const nuevo = { ...e, id: idRef.current, momento: Date.now() }
    setEventos((prev) => [nuevo, ...prev])
  }, [])

  const crear = (nuevo: Fusible) => {
    fRef.current = nuevo
    setFusible(nuevo)
    registrar({ tipo: 'creado' })
    registrar({ tipo: 'fondeado', monto: nuevo.fondeado })
  }

  /** Un intento de pago del agente: valida, y solo si pasa aplica el cambio. */
  const pagar = useCallback(
    (monto: number, destino: Destino) => {
      const f = fRef.current
      if (!f) return

      const r = intentarPago(f, monto, destino.direccion, Date.now())
      if (!r.ok) {
        registrar({
          tipo: 'bloqueado',
          monto,
          destino: destino.alias,
          motivo: r.motivo as MotivoRechazo,
        })
        return
      }

      const actualizado = { ...f, gastado: f.gastado + monto }
      fRef.current = actualizado
      setFusible(actualizado)
      registrar({ tipo: 'pago', monto, destino: destino.alias })
    },
    [registrar],
  )

  const cortar = () => {
    const f = fRef.current
    if (!f || f.estado === 'cortado') return
    const actualizado: Fusible = { ...f, estado: 'cortado' }
    fRef.current = actualizado
    setFusible(actualizado)
    setCorriendo(false)
    registrar({ tipo: 'cortado' })
  }

  const retirar = () => {
    const f = fRef.current
    if (!f) return
    const monto = f.fondeado - f.gastado
    if (monto <= 0) return
    const actualizado = { ...f, fondeado: f.gastado }
    fRef.current = actualizado
    setFusible(actualizado)
    registrar({ tipo: 'retiro', monto })
  }

  const reiniciar = () => {
    fRef.current = null
    setFusible(null)
    setEventos([])
    setCorriendo(false)
    idRef.current = 0
  }

  // El agente "dejado corriendo": paga solo, cada 900 ms, hasta que el
  // fusible lo detiene. Es el escenario central de la demostración.
  useEffect(() => {
    if (!corriendo) return
    const t = setInterval(() => {
      const d = DESTINOS[Math.floor(Math.random() * DESTINOS.length)]
      const monto = Number((0.3 + Math.random() * 0.9).toFixed(2))
      pagar(monto, d)
    }, 900)
    return () => clearInterval(t)
  }, [corriendo, pagar])

  // Si el fusible ya no admite más pagos, el agente deja de intentar.
  useEffect(() => {
    if (!fusible || !corriendo) return
    const sinCupo = fusible.topeTotal - fusible.gastado < 0.3
    if (fusible.estado === 'cortado' || sinCupo) setCorriendo(false)
  }, [fusible, corriendo])

  return (
    <div className="app">
      <Encabezado />

      {!conectado && <Conectar onConectar={() => setConectado(true)} />}

      {conectado && !fusible && <CrearFusible onCrear={crear} />}

      {conectado && fusible && (
        <main className="tablero">
          <div className="columna">
            <Panel
              fusible={fusible}
              onCortar={cortar}
              onRetirar={retirar}
              onReiniciar={reiniciar}
            />
            <ConsolaAgente
              fusible={fusible}
              corriendo={corriendo}
              onPagar={pagar}
              onCorriendo={setCorriendo}
            />
          </div>
          <Historial eventos={eventos} />
        </main>
      )}

      <footer className="pie">
        Prototipo de interfaz · los datos son simulados en el navegador · la
        lógica de reglas vive en <code>src/dominio.ts</code> y se traduce a un
        contrato Soroban en la semana 4
      </footer>
    </div>
  )
}
