import { useCallback, useEffect, useState } from 'react'
import {
  CONTRACT_ID,
  aUnidades,
  urlContrato,
  urlTx,
} from '../stellar/config'
import {
  ErrorContrato,
  type EstadoCadena,
  leerEstado,
  pagar,
} from '../stellar/contrato'
import { corto, hora, money } from '../dominio'

const DESTINO_1 = import.meta.env.VITE_DESTINO_1 ?? ''
const AJENO = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'

interface Linea {
  id: number
  tipo: 'pago' | 'bloqueado' | 'info'
  texto: string
  detalle?: string
  hash?: string
  momento: number
}

/** Panel conectado al contrato desplegado en testnet. Nada es simulado. */
export default function PanelRed() {
  const [estado, setEstado] = useState<EstadoCadena | null>(null)
  const [cargando, setCargando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [fallo, setFallo] = useState<string | null>(null)
  const [lineas, setLineas] = useState<Linea[]>([])

  const anotar = (l: Omit<Linea, 'id' | 'momento'>) =>
    setLineas((p) => [{ ...l, id: Date.now() + Math.random(), momento: Date.now() }, ...p])

  const refrescar = useCallback(async () => {
    try {
      setEstado(await leerEstado())
      setFallo(null)
    } catch (e) {
      setFallo(e instanceof Error ? e.message : String(e))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void refrescar()
  }, [refrescar])

  const intentar = async (destino: string, monto: bigint, etiqueta: string) => {
    setOcupado(true)
    try {
      const r = await pagar(destino, monto)
      anotar({
        tipo: 'pago',
        texto: `Pago ejecutado · ${money(aUnidades(monto))} XLM`,
        detalle: etiqueta,
        hash: r.hash,
      })
      await refrescar()
    } catch (e) {
      const err = e as ErrorContrato
      anotar({
        tipo: 'bloqueado',
        texto: `Pago rechazado · ${money(aUnidades(monto))} XLM`,
        detalle: `${etiqueta} — ${err.message}`,
      })
    } finally {
      setOcupado(false)
    }
  }

  if (cargando) {
    return (
      <section className="tarjeta centrada">
        <h2>Leyendo el contrato…</h2>
        <p className="ayuda">Consultando el estado en la red de pruebas.</p>
      </section>
    )
  }

  if (fallo || !estado) {
    return (
      <section className="tarjeta centrada">
        <h2>No se pudo leer el contrato</h2>
        <p className="nota error">{fallo}</p>
        <p className="nota">
          Contrato: <code>{corto(CONTRACT_ID)}</code>
        </p>
      </section>
    )
  }

  const tope = aUnidades(estado.tope_total)
  const gastado = aUnidades(estado.gastado)
  const porOp = aUnidades(estado.tope_por_op)
  const usado = tope === 0 ? 0 : Math.min(100, (gastado / tope) * 100)
  const disponible = tope - gastado

  return (
    <main className="tablero">
      <div className="columna">
        <section className="tarjeta">
          <div className="fila-titulo">
            <h2>Presupuesto del agente</h2>
            <span className={`estado ${estado.cortado ? 'cortado' : 'activo'}`}>
              {estado.cortado ? 'Cortado' : 'Activo'}
            </span>
          </div>

          <p className="ayuda">
            Datos leídos del contrato{' '}
            <a href={urlContrato()} target="_blank" rel="noreferrer">
              {corto(CONTRACT_ID)}
            </a>{' '}
            en la red de pruebas. No hay nada simulado en esta pantalla.
          </p>

          <div className="medidor">
            <div className="cifras">
              <strong>{money(gastado)}</strong>
              <span>de {money(tope)} XLM</span>
            </div>
            <div className="barra">
              <div
                className={`relleno ${usado >= 100 ? 'lleno' : ''}`}
                style={{ width: `${usado}%` }}
              />
            </div>
            <small>Quedan {money(Math.max(0, disponible))} XLM por gastar</small>
          </div>

          <dl className="datos">
            <div>
              <dt>Tope por operación</dt>
              <dd>{money(porOp)} XLM</dd>
            </div>
            <div>
              <dt>Destinos permitidos</dt>
              <dd>{estado.destinos.length}</dd>
            </div>
            <div>
              <dt>Vence</dt>
              <dd>{new Date(Number(estado.vigencia_hasta) * 1000).toLocaleDateString('es-CO')}</dd>
            </div>
            <div>
              <dt>Agente</dt>
              <dd>
                <code>{corto(estado.agent)}</code>
              </dd>
            </div>
          </dl>

          <button className="boton fantasma" onClick={() => void refrescar()}>
            Volver a leer el contrato
          </button>
        </section>

        <section className="tarjeta consola">
          <h2>Agente de demostración</h2>
          <p className="ayuda">
            Cada botón arma una transacción real, la firma con la llave del
            agente y la envía a la red de pruebas.
          </p>

          <div className="botones">
            <button
              className="boton"
              disabled={ocupado}
              onClick={() => void intentar(DESTINO_1, 10_000_000n, 'Destino permitido')}
            >
              Pagar 1 XLM a un servicio permitido
              <small>Dentro de las reglas: debería pasar</small>
            </button>

            <button
              className="boton"
              disabled={ocupado}
              onClick={() => void intentar(DESTINO_1, 200_000_000n, 'Destino permitido')}
            >
              Pagar 20 XLM (el tope por operación es {money(porOp)})
              <small>El contrato debería rechazarlo</small>
            </button>

            <button
              className="boton"
              disabled={ocupado}
              onClick={() => void intentar(AJENO, 10_000_000n, 'Dirección fuera de la lista')}
            >
              Pagar 1 XLM a una dirección desconocida
              <small>Hay saldo, pero el destino no está autorizado</small>
            </button>
          </div>

          {ocupado && (
            <p className="nota corriendo">
              Simulando, firmando y esperando el cierre del ledger… (~5 s)
            </p>
          )}
        </section>
      </div>

      <section className="tarjeta historial">
        <div className="fila-titulo">
          <h2>Registro</h2>
          <span className="resumen">
            {lineas.filter((l) => l.tipo === 'pago').length} ejecutados ·{' '}
            {lineas.filter((l) => l.tipo === 'bloqueado').length} rechazados
          </span>
        </div>
        <p className="ayuda">
          Cada pago ejecutado deja un hash verificable por cualquiera. Los
          rechazos los detiene el contrato en la simulación, antes de gastar
          comisión.
        </p>

        <ol className="eventos">
          {lineas.map((l) => (
            <li key={l.id} className={l.tipo}>
              <span className="hora">{hora(l.momento)}</span>
              <div className="cuerpo">
                <strong>{l.texto}</strong>
                {l.detalle && <p className="motivo">{l.detalle}</p>}
                {l.hash && (
                  <a
                    className="destino-ev"
                    href={urlTx(l.hash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ver en el explorador ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
