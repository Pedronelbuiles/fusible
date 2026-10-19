import { useEffect, useState } from 'react'
import type { Firmante } from './stellar/firmante'
import Encabezado from './components/Encabezado'
import Landing from './components/Landing'
import PanelRed from './components/PanelRed'
import Tour, { PASOS_TOUR, yaVioElTour } from './components/Tour'

export default function App() {
  const [firmante, setFirmante] = useState<Firmante | null>(null)
  const [tour, setTour] = useState(false)

  // El recorrido vive aquí y no dentro del panel: así aparece igual en la
  // pantalla de crear el primer fusible que en la del panel, y el enlace
  // para relanzarlo existe en todas.
  useEffect(() => {
    if (firmante && !yaVioElTour()) setTour(true)
  }, [firmante])

  return (
    <div className="app">
      <Encabezado
        firmante={firmante}
        onSalir={() => setFirmante(null)}
        onTour={() => setTour(true)}
      />

      {firmante ? (
        <PanelRed firmante={firmante} />
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
