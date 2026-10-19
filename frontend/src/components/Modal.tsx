import { useEffect } from 'react'

/**
 * Ventana sobre la pantalla. Existe porque los mensajes que importan
 * —que una transacción está en curso, que algo falló— estaban al pie de una
 * tarjeta larga y nadie los veía.
 */
export function Modal({
  children,
  onCerrar,
}: {
  children: React.ReactNode
  onCerrar?: () => void
}) {
  // Escape cierra, pero solo si se puede cerrar: durante un proceso no.
  useEffect(() => {
    if (!onCerrar) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onCerrar])

  return (
    <div
      className="velo"
      role="dialog"
      aria-modal="true"
      onClick={onCerrar ? (e) => e.target === e.currentTarget && onCerrar() : undefined}
    >
      <div className="modal">{children}</div>
    </div>
  )
}

export interface PasoProceso {
  texto: string
  estado: 'pendiente' | 'activo' | 'hecho'
}

/** Qué está pasando en la red, paso por paso. No se puede cerrar. */
export function ModalProceso({
  titulo,
  pasos,
  nota,
}: {
  titulo: string
  pasos: PasoProceso[]
  nota?: string
}) {
  return (
    <Modal>
      <div className="modal-cabeza">
        <span className="girando" aria-hidden="true" />
        <h3>{titulo}</h3>
      </div>

      <ol className="pasos">
        {pasos.map((p, i) => (
          <li key={i} className={p.estado}>
            <span className="marca" aria-hidden="true">
              {p.estado === 'hecho' ? '✓' : p.estado === 'activo' ? '•' : ''}
            </span>
            {p.texto}
          </li>
        ))}
      </ol>

      <p className="modal-nota">
        {nota ?? 'La red cierra un bloque cada ~5 segundos. No cierres la ventana.'}
      </p>
    </Modal>
  )
}

/** Algo falló. Se cierra y se puede reintentar. */
export function ModalError({
  titulo,
  mensaje,
  onCerrar,
  detalle,
}: {
  titulo: string
  mensaje: string
  onCerrar: () => void
  detalle?: string
}) {
  return (
    <Modal onCerrar={onCerrar}>
      <div className="modal-cabeza">
        <span className="aviso" aria-hidden="true">
          !
        </span>
        <h3>{titulo}</h3>
      </div>

      <p className="modal-mensaje">{mensaje}</p>
      {detalle && <p className="modal-nota">{detalle}</p>}

      <button className="boton primario" onClick={onCerrar} autoFocus>
        Entendido
      </button>
    </Modal>
  )
}
