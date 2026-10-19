import { Networks } from '@stellar/stellar-sdk'

export const RPC_URL = 'https://soroban-testnet.stellar.org'
export const NETWORK_PASSPHRASE = Networks.TESTNET
export const EXPLORER = 'https://stellar.expert/explorer/testnet'

/** Id del contrato desplegado. Se inyecta en build; ver `.env`. */
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? ''

/** Dirección del agente autorizado en el fusible desplegado. */
export const AGENTE_ID = import.meta.env.VITE_AGENTE_ID ?? ''

/** Siete decimales, como todos los activos de Stellar. */
export const DECIMALES = 10_000_000

export const aStroops = (x: number) => BigInt(Math.round(x * DECIMALES))
export const aUnidades = (x: bigint | number) => Number(x) / DECIMALES

export const hayContrato = () => CONTRACT_ID.length > 0

export const urlContrato = (id = CONTRACT_ID) => `${EXPLORER}/contract/${id}`
export const urlTx = (hash: string) => `${EXPLORER}/tx/${hash}`
