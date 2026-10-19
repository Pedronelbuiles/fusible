import {
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk'
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from './config'

const server = new rpc.Server(RPC_URL)
const contrato = () => new Contract(CONTRACT_ID)

/** Llave del agente de DEMOSTRACIÓN. Solo testnet: ver `.env.example`. */
const SECRETO_AGENTE = import.meta.env.VITE_AGENTE_SECRET ?? ''
const agente = () => Keypair.fromSecret(SECRETO_AGENTE)

export const hayAgente = () => SECRETO_AGENTE.length > 0

/** Estado del fusible tal como lo guarda el contrato. */
export interface EstadoCadena {
  owner: string
  agent: string
  token: string
  tope_total: bigint
  tope_por_op: bigint
  destinos: string[]
  vigencia_hasta: bigint
  fondeado: bigint
  gastado: bigint
  cortado: boolean
}

/** Los mismos códigos que declara el contrato en `Error`. */
export const ERRORES: Record<number, string> = {
  1: 'El fusible ya estaba inicializado',
  2: 'El fusible no está inicializado',
  3: 'Parámetros inválidos',
  4: 'El fusible fue cortado',
  5: 'Fuera de la ventana de vigencia',
  6: 'El destino no está en la lista permitida',
  7: 'Supera el tope por operación',
  8: 'Supera el tope total disponible',
  9: 'Monto inválido',
  10: 'No queda remanente por retirar',
}

export class ErrorContrato extends Error {
  codigo: number | null

  constructor(codigo: number | null, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorContrato'
    this.codigo = codigo
  }
}

/** Extrae `#N` de un error de simulación y lo traduce. */
function interpretar(crudo: string): ErrorContrato {
  const m = crudo.match(/Error\(Contract,\s*#(\d+)\)/)
  if (m) {
    const codigo = Number(m[1])
    return new ErrorContrato(codigo, ERRORES[codigo] ?? `Error del contrato #${codigo}`)
  }
  return new ErrorContrato(null, crudo)
}

const dirScVal = (d: string) => nativeToScVal(d, { type: 'address' })
const i128 = (n: bigint) => nativeToScVal(n, { type: 'i128' })

/**
 * Lectura: simula la invocación y devuelve el valor. No firma, no envía y no
 * cuesta nada, igual que la sesión 5 describió las lecturas.
 */
async function leer<T>(metodo: string): Promise<T> {
  const cuenta = await server.getAccount(agente().publicKey())
  const tx = new TransactionBuilder(cuenta, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contrato().call(metodo))
    .setTimeout(30)
    .build()

  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) throw interpretar(sim.error)
  if (!sim.result?.retval) throw new ErrorContrato(null, 'El contrato no devolvió valor')
  return scValToNative(sim.result.retval) as T
}

export const leerEstado = () => leer<EstadoCadena>('estado')
export const leerDisponible = () => leer<bigint>('disponible')

export interface ResultadoPago {
  hash: string
  gastado: bigint
}

/**
 * El agente paga. Simula primero: si alguna regla del contrato falla, el
 * error llega aquí con su código y no se gasta comisión. Si pasa, firma con
 * la llave del agente y envía de verdad.
 */
export async function pagar(destino: string, monto: bigint): Promise<ResultadoPago> {
  const kp = agente()
  const cuenta = await server.getAccount(kp.publicKey())

  const tx = new TransactionBuilder(cuenta, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contrato().call('pay', dirScVal(destino), i128(monto)))
    .setTimeout(60)
    .build()

  let preparada
  try {
    preparada = await server.prepareTransaction(tx)
  } catch (e) {
    throw interpretar(e instanceof Error ? e.message : String(e))
  }

  preparada.sign(kp)
  const envio = await server.sendTransaction(preparada)

  if (envio.status === 'ERROR') {
    throw interpretar(JSON.stringify(envio.errorResult ?? envio))
  }

  const final = await esperar(envio.hash)
  const gastado =
    final.returnValue !== undefined
      ? (scValToNative(final.returnValue) as bigint)
      : 0n

  return { hash: envio.hash, gastado }
}

/** Consulta el resultado hasta que el ledger cierra (~5 s). */
async function esperar(hash: string, intentos = 20) {
  for (let i = 0; i < intentos; i++) {
    const r = await server.getTransaction(hash)
    if (r.status === 'SUCCESS') return r
    if (r.status === 'FAILED') {
      throw interpretar(JSON.stringify(r.resultXdr ?? 'transacción fallida'))
    }
    await new Promise((res) => setTimeout(res, 1000))
  }
  throw new ErrorContrato(null, 'La red no confirmó la transacción a tiempo')
}
