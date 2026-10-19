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

/** Lo que Horizon dice que se cobró de verdad en las últimas operaciones. */
async function cobrosReales(cuenta, limite = 12) {
  const r = await fetch(
    `${HORIZON}/accounts/${cuenta}/transactions?order=desc&limit=${limite}`,
  )
  if (!r.ok) return []
  const j = await r.json()
  return (j._embedded?.records ?? [])
    .filter((t) => t.successful)
    .map((t) => ({
      hash: t.hash.slice(0, 10),
      cobrado: Number(t.fee_charged),
      maximo: Number(t.max_fee),
      xlm: xlm(t.fee_charged),
    }))
}

const vigencia = BigInt(Math.floor(Date.now() / 1000) + 86_400)

console.log('Contrato:', CONTRATO)
console.log('')

const simulaciones = [
  await medir('create_fuse', 'create_fuse',
    dir(dueno.publicKey()), dir(AGENTE), dir(TOKEN),
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
console.log('=== LO QUE LA RED COBRÓ DE VERDAD (cuenta del dueño) ===')
const reales = await cobrosReales(dueno.publicKey())
console.table(reales)

if (reales.length) {
  const prom = Math.round(reales.reduce((a, b) => a + b.cobrado, 0) / reales.length)
  const max = Math.max(...reales.map((r) => r.cobrado))
  console.log('')
  console.log(`promedio cobrado: ${prom} stroops (${xlm(prom)} XLM)`)
  console.log(`máximo cobrado:   ${max} stroops (${xlm(max)} XLM)`)
  console.log('')
  console.log('Mínimo de red por operación: 100 stroops (0.0000100 XLM)')
}
