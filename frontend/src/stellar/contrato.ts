import {
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk'
import {
  AGENTE_ID,
  AGENTE_SECRET,
  CONTRACT_ID,
  DUENO_ID,
  DUENO_SECRET,
  NETWORK_PASSPHRASE,
  RPC_URL,
  TOKEN_ID,
} from './config'

const server = new rpc.Server(RPC_URL)
const contrato = () => new Contract(CONTRACT_ID)

const dueno = () => Keypair.fromSecret(DUENO_SECRET)
const agente = () => Keypair.fromSecret(AGENTE_SECRET)

/** Estado de un fusible tal como lo guarda el contrato. */
export interface EstadoCadena {
  id: number
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
  1: 'No existe un fusible con ese identificador',
  2: 'Quien llama no es el dueño de este fusible',
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

function interpretar(crudo: string): ErrorContrato {
  const m = crudo.match(/Error\(Contract,\s*#(\d+)\)/)
  if (m) {
    const codigo = Number(m[1])
    return new ErrorContrato(codigo, ERRORES[codigo] ?? `Error del contrato #${codigo}`)
  }
  return new ErrorContrato(null, crudo)
}

const dir = (d: string) => nativeToScVal(d, { type: 'address' })
const i128 = (n: bigint) => nativeToScVal(n, { type: 'i128' })
const u32 = (n: number) => nativeToScVal(n, { type: 'u32' })
const u64 = (n: bigint) => nativeToScVal(n, { type: 'u64' })
const vecDir = (ds: string[]) =>
  xdr.ScVal.scvVec(ds.map((d) => dir(d)))

async function construir(fuente: Keypair, op: xdr.Operation) {
  const cuenta = await server.getAccount(fuente.publicKey())
  return new TransactionBuilder(cuenta, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(60)
    .build()
}

/** Lectura: simula, no firma, no cuesta nada. */
async function leer<T>(metodo: string, ...args: xdr.ScVal[]): Promise<T> {
  const tx = await construir(agente(), contrato().call(metodo, ...args))
  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) throw interpretar(sim.error)
  if (!sim.result?.retval) throw new ErrorContrato(null, 'El contrato no devolvió valor')
  return scValToNative(sim.result.retval) as T
}

/** Escritura: simula, firma y espera a que el ledger cierre. */
async function escribir<T>(
  firmante: Keypair,
  metodo: string,
  ...args: xdr.ScVal[]
): Promise<{ hash: string; valor: T }> {
  const tx = await construir(firmante, contrato().call(metodo, ...args))

  let preparada
  try {
    preparada = await server.prepareTransaction(tx)
  } catch (e) {
    throw interpretar(e instanceof Error ? e.message : String(e))
  }

  preparada.sign(firmante)
  const envio = await server.sendTransaction(preparada)
  if (envio.status === 'ERROR') {
    throw interpretar(JSON.stringify(envio.errorResult ?? envio))
  }

  const final = await esperar(envio.hash)
  const valor =
    final.returnValue !== undefined ? (scValToNative(final.returnValue) as T) : (undefined as T)
  return { hash: envio.hash, valor }
}

async function esperar(hash: string, intentos = 25) {
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

// ---- operaciones del dueño ----

export interface ReglasNuevas {
  topeTotal: bigint
  topePorOperacion: bigint
  destinos: string[]
  vigenciaHasta: bigint
}

/** Crea un fusible nuevo en la red y devuelve su id. Lo firma el dueño. */
export async function crearFusible(r: ReglasNuevas) {
  return escribir<number>(
    dueno(),
    'create_fuse',
    dir(DUENO_ID),
    dir(AGENTE_ID),
    dir(TOKEN_ID),
    i128(r.topeTotal),
    i128(r.topePorOperacion),
    vecDir(r.destinos),
    u64(r.vigenciaHasta),
  )
}

export const fondear = (id: number, monto: bigint) =>
  escribir<bigint>(dueno(), 'fund', u32(id), i128(monto))

export const cortar = (id: number) => escribir<void>(dueno(), 'revoke', u32(id))

export const retirar = (id: number) => escribir<bigint>(dueno(), 'sweep', u32(id))

// ---- operaciones del agente ----

export const pagar = (id: number, destino: string, monto: bigint) =>
  escribir<bigint>(agente(), 'pay', u32(id), dir(destino), i128(monto))

// ---- lecturas ----

export const leerEstado = (id: number) => leer<EstadoCadena>('estado', u32(id))
export const leerTotal = () => leer<number>('total')
