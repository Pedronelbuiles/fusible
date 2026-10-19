import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from '@stellar/freighter-api'
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk'
import { NETWORK_PASSPHRASE } from './config'

/**
 * Quién firma una transacción. Hay dos orígenes posibles y el resto del
 * código no necesita saber cuál está en uso:
 *
 * - **Freighter**: el usuario firma con su propia billetera. Es el modo real.
 * - **Llave local**: una llave de testnet embebida en el bundle. Existe para
 *   que cualquiera pueda probar la aplicación sin instalar nada, y para
 *   grabar la demostración.
 */
export interface Firmante {
  direccion: string
  etiqueta: string
  esFreighter: boolean
  firmar: (xdr: string) => Promise<string>
}

export class ErrorFreighter extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ErrorFreighter'
  }
}

/** Firma con una llave que vive en el navegador. Solo testnet. */
export function firmanteLocal(secreto: string, etiqueta: string): Firmante {
  const kp = Keypair.fromSecret(secreto)
  return {
    direccion: kp.publicKey(),
    etiqueta,
    esFreighter: false,
    firmar: async (xdr) => {
      const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE)
      tx.sign(kp)
      return tx.toXDR()
    },
  }
}

/** ¿Está la extensión instalada en este navegador? */
export async function hayFreighter(): Promise<boolean> {
  try {
    const r = await isConnected()
    return r.isConnected === true
  } catch {
    return false
  }
}

/**
 * Pide acceso a la billetera y devuelve un firmante.
 * Comprueba además que esté en testnet: firmar en la red equivocada es un
 * error silencioso que después cuesta mucho encontrar.
 */
export async function conectarFreighter(): Promise<Firmante> {
  if (!(await hayFreighter())) {
    throw new ErrorFreighter(
      'No se detectó Freighter en este navegador. Instálalo desde freighter.app o usa el modo de demostración.',
    )
  }

  const acceso = await requestAccess()
  if (acceso.error) {
    throw new ErrorFreighter(
      'Freighter no autorizó la conexión. Vuelve a intentarlo y acepta el permiso.',
    )
  }

  const red = await getNetwork()
  if (red.error) {
    throw new ErrorFreighter('No se pudo leer la red configurada en Freighter.')
  }
  if (red.networkPassphrase !== NETWORK_PASSPHRASE) {
    throw new ErrorFreighter(
      `Freighter está en "${red.network}". Cámbialo a Test Net y vuelve a conectar.`,
    )
  }

  const direccion = acceso.address || (await getAddress()).address
  if (!direccion) {
    throw new ErrorFreighter('Freighter no devolvió ninguna dirección.')
  }

  return {
    direccion,
    etiqueta: 'Freighter',
    esFreighter: true,
    firmar: async (xdr) => {
      const r = await signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: direccion,
      })
      if (r.error) {
        throw new ErrorFreighter('Rechazaste la firma en Freighter, o la extensión falló.')
      }
      return r.signedTxXdr
    },
  }
}
