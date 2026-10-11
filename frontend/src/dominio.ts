/**
 * Reglas del fusible.
 *
 * Este archivo es deliberadamente independiente de React: es la lógica que en
 * la semana 4 se traduce al contrato en Soroban. El orden de las validaciones
 * de `intentarPago` es el mismo que tendrá el contrato, para que el front y la
 * red se comporten igual.
 */

export type EstadoFusible = 'activo' | 'cortado'

export type MotivoRechazo =
  | 'fusible_cortado'
  | 'fuera_de_vigencia'
  | 'destino_no_autorizado'
  | 'excede_tope_por_operacion'
  | 'excede_tope_total'

export interface Destino {
  alias: string
  direccion: string
}

export interface Fusible {
  agente: string
  topeTotal: number
  topePorOperacion: number
  destinos: Destino[]
  vigenciaHasta: number
  fondeado: number
  gastado: number
  estado: EstadoFusible
}

export type TipoEvento =
  | 'creado'
  | 'fondeado'
  | 'pago'
  | 'bloqueado'
  | 'cortado'
  | 'retiro'

export interface Evento {
  id: number
  tipo: TipoEvento
  momento: number
  monto?: number
  destino?: string
  motivo?: MotivoRechazo
}

export type Resultado =
  | { ok: true }
  | { ok: false; motivo: MotivoRechazo }

export const MOTIVOS: Record<MotivoRechazo, string> = {
  fusible_cortado: 'El fusible fue cortado',
  fuera_de_vigencia: 'Fuera de la ventana de vigencia',
  destino_no_autorizado: 'El destino no está en la lista permitida',
  excede_tope_por_operacion: 'Supera el tope por operación',
  excede_tope_total: 'Supera el tope total disponible',
}

/**
 * Valida un pago contra todas las reglas, en el mismo orden que lo hará el
 * contrato. No muta el fusible: devolver el resultado y aplicarlo son pasos
 * separados, igual que simular y enviar una transacción.
 */
export function intentarPago(
  f: Fusible,
  monto: number,
  direccion: string,
  ahora: number,
): Resultado {
  if (f.estado === 'cortado') {
    return { ok: false, motivo: 'fusible_cortado' }
  }
  if (ahora > f.vigenciaHasta) {
    return { ok: false, motivo: 'fuera_de_vigencia' }
  }
  if (!f.destinos.some((d) => d.direccion === direccion)) {
    return { ok: false, motivo: 'destino_no_autorizado' }
  }
  if (monto > f.topePorOperacion) {
    return { ok: false, motivo: 'excede_tope_por_operacion' }
  }
  if (f.gastado + monto > f.topeTotal) {
    return { ok: false, motivo: 'excede_tope_total' }
  }
  return { ok: true }
}

export const disponible = (f: Fusible) => f.topeTotal - f.gastado

export const porcentajeUsado = (f: Fusible) =>
  f.topeTotal === 0 ? 0 : Math.min(100, (f.gastado / f.topeTotal) * 100)

export const remanente = (f: Fusible) => f.fondeado - f.gastado

/** Formato de 7 decimales, como los activos de Stellar. */
export const money = (n: number) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 7 })

export const hora = (ms: number) =>
  new Date(ms).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

export const corto = (dir: string) =>
  dir.length > 14 ? `${dir.slice(0, 6)}…${dir.slice(-4)}` : dir
