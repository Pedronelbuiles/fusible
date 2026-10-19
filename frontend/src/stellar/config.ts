import { Networks } from '@stellar/stellar-sdk'

export const RPC_URL = 'https://soroban-testnet.stellar.org'
export const NETWORK_PASSPHRASE = Networks.TESTNET
export const EXPLORER = 'https://stellar.expert/explorer/testnet'

/** Contrato desplegado. Administra todos los fusibles. Ver `.env`. */
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? ''

/** SAC del XLM nativo en testnet: el activo que mueven los fusibles. */
export const TOKEN_ID = import.meta.env.VITE_TOKEN_ID ?? ''

/**
 * Llaves de DEMOSTRACIÓN, solo testnet. Quedan embebidas en el bundle y
 * cualquiera puede leerlas: es intencional. Son fondos de prueba sin valor,
 * y sirven para enseñar el punto del producto — la llave del agente es
 * pública y aun así no puede exceder el tope ni pagar fuera de la lista,
 * porque quien lo impide es el contrato.
 */
export const DUENO_ID = import.meta.env.VITE_DUENO_ID ?? ''
export const DUENO_SECRET = import.meta.env.VITE_DUENO_SECRET ?? ''
export const AGENTE_ID = import.meta.env.VITE_AGENTE_ID ?? ''
export const AGENTE_SECRET = import.meta.env.VITE_AGENTE_SECRET ?? ''

export const DESTINOS = [
  { alias: 'Modelo de lenguaje', direccion: import.meta.env.VITE_DESTINO_1 ?? '' },
  { alias: 'Enriquecimiento de datos', direccion: import.meta.env.VITE_DESTINO_2 ?? '' },
].filter((d) => d.direccion)

/** Una dirección válida que nunca se agrega a la lista permitida. */
export const DESTINO_HOSTIL = {
  alias: 'Dirección desconocida',
  direccion: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
}

/** Siete decimales, como todos los activos de Stellar. */
export const DECIMALES = 10_000_000

export const aStroops = (x: number) => BigInt(Math.round(x * DECIMALES))
export const aUnidades = (x: bigint | number) => Number(x) / DECIMALES

export const hayContrato = () =>
  CONTRACT_ID.length > 0 && DUENO_SECRET.length > 0 && AGENTE_SECRET.length > 0

export const urlContrato = (id = CONTRACT_ID) => `${EXPLORER}/contract/${id}`
export const urlTx = (hash: string) => `${EXPLORER}/tx/${hash}`
