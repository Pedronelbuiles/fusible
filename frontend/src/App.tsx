import { useState } from 'react'
import type { Firmante } from './stellar/firmante'
import Encabezado from './components/Encabezado'
import Landing from './components/Landing'
import PanelRed from './components/PanelRed'

export default function App() {
  const [firmante, setFirmante] = useState<Firmante | null>(null)

  return (
    <div className="app">
      <Encabezado firmante={firmante} onSalir={() => setFirmante(null)} />

      {firmante ? (
        <PanelRed firmante={firmante} />
      ) : (
        <Landing onEntrar={setFirmante} />
      )}

      <footer className="pie">
        Las reglas viven en un contrato en Soroban, sobre la red de pruebas de
        Stellar. Todo lo que ocurre aquí se puede verificar en el explorador.
      </footer>
    </div>
  )
}
