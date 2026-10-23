/**
 * Mide cuánto cuesta cada operación del contrato Fusible en Stellar testnet.
 *
 * Dos fuentes, a propósito:
 *   1. La simulación, que predice el fee antes de enviar.
 *   2. Horizon, que dice lo que la red cobró de verdad.
 *
 * Uso (desde frontend/):
 *   npm run medir
 */
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

const RPC_URL = 'https://soroban-testnet.stellar.org'
const HORIZON = 'https://horizon-testnet.stellar.org'
const PASSPHRASE = 'Test SDF Network ; September 2015'
const STROOPS_POR_XLM = 10_000_000

const {
  VITE_CONTRACT_ID: CONTRATO,
  VITE_TOKEN_ID: TOKEN,
  VITE_DUENO_SECRET: DUENO_SEC,
  VITE_AGENTE_ID: AGENTE,
  VITE_DESTINO_1: DESTINO,
} = process.env

if (!CONTRATO || !DUENO_SEC) {
  console.error('Faltan variables. Corre con: npm run medir')
  process.exit(1)
}

const server = new rpc.Server(RPC_URL)
const dueno = Keypair.fromSecret(DUENO_SEC)
const contrato = new Contract(CONTRATO)

const dir = (d) => nativeToScVal(d, { type: 'address' })
const i128 = (n) => nativeToScVal(n, { type: 'i128' })
const u32 = (n) => nativeToScVal(n, { type: 'u32' })
const u64 = (n) => nativeToScVal(n, { type: 'u64' })
const str = (s) => nativeToScVal(s, { type: 'string' })

const xlm = (stroops) => (Number(stroops) / STROOPS_POR_XLM).toFixed(7)

/** Simula una invocación y devuelve el fee que la red exigiría. */
async function medir(nombre, ...args) {
  const cuenta = await server.getAccount(dueno.publicKey())
  const tx = new TransactionBuilder(cuenta, {
    fee: BASE_FEE,
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(contrato.call(...args))
    .setTimeout(60)
    .build()

  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) {
    return { nombre, error: sim.error.slice(0, 90) }
  }

  const preparada = await server.prepareTransaction(tx)
  const total = Number(preparada.fee)
  const recursos = Number(sim.minResourceFee ?? 0)

  return {
    nombre,
    inclusion: total - recursos,
    recursos,
    total,
    totalXlm: xlm(total),
  }
}

/**
 * Lo que Horizon dice que se cobró de verdad, por función del contrato.
 *
 * Hay que leer las dos cuentas: el dueño firma `create_fuse`, `fund`,
 * `revoke` y `sweep`, pero **`pay` lo firma el agente**. Mirando solo la del
 * dueño no se ve ni un pago, y es fácil confundir el costo de otra cosa con
 * el del pago — que es justo la operación que se repite.
 */
const simbolo = (b64) => {
  try {
    return String(scValToNative(xdr.ScVal.fromXDR(b64, 'base64')))
  } catch {
    return null
  }
}

async function cobrosPorFuncion(cuentas, limite = 50) {
  const filas = []
  for (const [etiqueta, cuenta] of Object.entries(cuentas)) {
    const r = await fetch(
      `${HORIZON}/accounts/${cuenta}/operations?order=desc&limit=${limite}&join=transactions`,
    )
    if (!r.ok) continue
    const j = await r.json()
    for (const op of j._embedded?.records ?? []) {
      if (op.type !== 'invoke_host_function') continue
      if (!op.transaction_successful) continue
      const fn = simbolo(op.parameters?.[1]?.value)
      if (!fn) continue
      filas.push({ fn, quien: etiqueta, fee: Number(op.transaction.fee_charged) })
    }
  }

  const porFn = {}
  for (const f of filas) (porFn[f.fn] ??= { quien: f.quien, fees: [] }).fees.push(f.fee)

  return Object.entries(porFn)
    .map(([fn, v]) => ({
      funcion: fn,
      lo_firma: v.quien,
      veces: v.fees.length,
      min: Math.min(...v.fees),
      max: Math.max(...v.fees),
      XLM_tipico: xlm(Math.min(...v.fees)),
    }))
    .sort((a, b) => a.min - b.min)
}

const vigencia = BigInt(Math.floor(Date.now() / 1000) + 86_400)

console.log('Contrato:', CONTRATO)
console.log('')

const simulaciones = [
  await medir('create_fuse', 'create_fuse',
    dir(dueno.publicKey()), str('Medicion de costos'), dir(AGENTE), dir(TOKEN),
    i128(50_000_000n), i128(10_000_000n),
    xdr.ScVal.scvVec([dir(DESTINO)]), u64(vigencia)),
  await medir('fund', 'fund', u32(1), i128(10_000_000n)),
  await medir('pay (agente)', 'pay', u32(1), dir(DESTINO), i128(1_000_000n)),
  await medir('revoke', 'revoke', u32(1)),
  await medir('estado (lectura)', 'estado', u32(1)),
  await medir('de_dueno (lectura)', 'de_dueno', dir(dueno.publicKey())),
]

console.log('=== FEE SEGÚN LA SIMULACIÓN (stroops) ===')
console.table(
  simulaciones.map((s) =>
    s.error
      ? { operacion: s.nombre, error: s.error }
      : {
          operacion: s.nombre,
          inclusion: s.inclusion,
          recursos: s.recursos,
          total: s.total,
          XLM: s.totalXlm,
        },
  ),
)

console.log('')
console.log('=== LO QUE LA RED COBRÓ DE VERDAD, POR FUNCIÓN ===')
console.log('fee_charged real de Horizon. No son estimaciones.')
console.table(
  await cobrosPorFuncion({
    dueno: dueno.publicKey(),
    agente: AGENTE,
  }),
)
console.log('')
console.log('Ojo: la simulación reserva fee para extender el TTL de los datos.')
console.log('La red solo lo cobra cuando toca extenderlo de verdad, así que el')
console.log('cobro real suele ser muy inferior al que estima la simulación.')
console.log('')
console.log('Mínimo de red por operación: 100 stroops (0.0000100 XLM)')
