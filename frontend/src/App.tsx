import { useCallback, useRef, useState } from 'react'
import type { Firmante } from './stellar/firmante'
import Encabezado from './components/Encabezado'
import Landing from './components/Landing'
import PanelRed from './components/PanelRed'
import Tour, { PASOS_TOUR } from './components/Tour'

export default function App() {
  const [firmante, setFirmante] = useState<Firmante | null>(null)
  const [tour, setTour] = useState(false)
  const mostradas = useRef<Set<string>>(new Set())

  /**
   * El recorrido sale solo al entrar a una pantalla, no una única vez en la
   * vida: cada pantalla explica cosas distintas. Se recuerda cuáles ya se
   * mostraron para no repetirlas al ir y volver, y se olvida al recargar.
   */
  const alEntrarA = useCallback((pantalla: string) => {
    if (mostradas.current.has(pantalla)) return
    mostradas.current.add(pantalla)
    setTour(true)
  }, [])

  const salir = () => {
    setFirmante(null)
    mostradas.current.clear()
  }

  return (
    <div className="app">
      <Encabezado
        firmante={firmante}
        onSalir={salir}
        onTour={() => setTour(true)}
      />

      {firmante ? (
        <PanelRed firmante={firmante} onPantalla={alEntrarA} />
      ) : (
        <Landing onEntrar={setFirmante} />
      )}

      {tour && firmante && (
        <Tour pasos={PASOS_TOUR} onCerrar={() => setTour(false)} />
      )}

      <footer className="pie">
        Las reglas viven en un contrato en Soroban, sobre la red de pruebas de
        Stellar. Todo lo que ocurre aquí se puede verificar en el explorador.
      </footer>
    </div>
  )
}
