export default function Encabezado() {
  return (
    <header className="encabezado">
      <div className="marca">
        <svg viewBox="0 0 120 48" className="logo" aria-hidden="true">
          <g stroke="var(--ambar)" strokeWidth="6" fill="none">
            <rect x="34" y="12" width="52" height="24" rx="6" />
            <line x1="6" y1="24" x2="34" y2="24" strokeLinecap="round" />
            <line x1="86" y1="24" x2="114" y2="24" strokeLinecap="round" />
            <line x1="44" y1="24" x2="54" y2="24" strokeLinecap="round" />
            <line x1="66" y1="24" x2="76" y2="24" strokeLinecap="round" />
          </g>
        </svg>
        <div>
          <h1>Fusible</h1>
          <p>Límites de gasto para agentes que pagan solos</p>
        </div>
      </div>
      <span className="red">testnet</span>
    </header>
  )
}
