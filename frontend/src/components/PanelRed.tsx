import { useCallback, useEffect, useState } from 'react'
import {
  AGENTE_ID,
  DESTINOS,
  DESTINO_HOSTIL,
  aStroops,
  aUnidades,
  urlContrato,
  urlTx,
} from '../stellar/config'
import {
  type ErrorContrato,
  type EstadoCadena,
  cortar,
  crearFusible,
  duenoDemo,
  fondear,
  leerEstado,
  leerTotal,
  pagar,
  retirar,
} from '../stellar/contrato'
import {
  ErrorFreighter,
  type Firmante,
  conectarFreighter,
  hayFreighter,
} from '../stellar/firmante'
import { corto, hora, money } from '../dominio'

interface Linea {
  id: number
  tipo: 'pago' | 'bloqueado' | 'creado' | 'fondeado' | 'cortado' | 'retiro'
  texto: string
  detalle?: string
  hash?: string
  momento: number
}

const ETIQUETA_TIPO: Record<Linea['tipo'], string> = {
  creado: 'creado',
  fondeado: 'fondeado',
  pago: 'pago',
  bloqueado: 'bloqueado',
  cortado: 'cortado',
  retiro: 'retiro',
}

export default function PanelRed() {
  const [firmante, setFirmante] = useState<Firmante>(() => duenoDemo())
  const [freighterDisponible, setFreighterDisponible] = useState(false)
  const [idFusible, setIdFusible] = useState<number | null>(null)
  const [estado, setEstado] = useState<EstadoCadena | null>(null)
  const [cargando, setCargando] = useState(true)
  const [paso, setPaso] = useState<string | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)
  const [lineas, setLineas] = useState<Linea[]>([])
  const [creando, setCreando] = useState(false)

  const anotar = (l: Omit<Linea, 'id' | 'momento'>) =>
    setLineas((p) => [{ ...l, id: Date.now() + Math.random(), momento: Date.now() }, ...p])

  const cargar = useCallback(async (id: number) => {
    setEstado(await leerEstado(id))
    setIdFusible(id)
    setFallo(null)
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        setFreighterDisponible(await hayFreighter())
        const total = await leerTotal()
        if (total > 0) await cargar(total)
      } catch (e) {
        setFallo(e instanceof Error ? e.message : String(e))
      } finally {
        setCargando(false)
      }
    })()
  }, [cargar])

  const conectar = async () => {
    try {
      setFirmante(await conectarFreighter())
      setFallo(null)
    } catch (e) {
      setFallo(e instanceof ErrorFreighter ? e.message : String(e))
    }
  }

  // ---- acciones ----

  const crear = async (
    topeTotal: number,
    topePorOp: number,
    horas: number,
    deposito: number,
  ) => {
    setPaso('Creando el fusible en la red…')
    try {
      const vig = BigInt(Math.floor(Date.now() / 1000) + horas * 3600)
      const r = await crearFusible(firmante, {
        topeTotal: aStroops(topeTotal),
        topePorOperacion: aStroops(topePorOp),
        destinos: DESTINOS.map((d) => d.direccion),
        vigenciaHasta: vig,
      })
      anotar({
        tipo: 'creado',
        texto: `Fusible #${r.valor} creado`,
        detalle: `Tope ${money(topeTotal)} XLM · máximo ${money(topePorOp)} por operación`,
        hash: r.hash,
      })

      setPaso('Depositando el presupuesto…')
      const f = await fondear(firmante, r.valor, aStroops(deposito))
      anotar({
        tipo: 'fondeado',
        texto: `Presupuesto depositado · ${money(deposito)} XLM`,
        hash: f.hash,
      })

      await cargar(r.valor)
      setCreando(false)
    } catch (e) {
      const err = e as ErrorContrato
      setFallo(err.message)
    } finally {
      setPaso(null)
    }
  }

  const intentarPago = async (destino: string, monto: number, etiqueta: string) => {
    if (idFusible === null) return
    setPaso('Simulando, firmando y esperando el cierre del ledger…')
    try {
      const r = await pagar(idFusible, destino, aStroops(monto))
      anotar({
        tipo: 'pago',
        texto: `Pago ejecutado · ${money(monto)} XLM`,
        detalle: etiqueta,
        hash: r.hash,
      })
      await cargar(idFusible)
    } catch (e) {
      const err = e as ErrorContrato
      anotar({
        tipo: 'bloqueado',
        texto: `Pago rechazado · ${money(monto)} XLM`,
        detalle: `${etiqueta} — ${err.message}`,
      })
    } finally {
      setPaso(null)
    }
  }

  const accionDueno = async (
    fn: () => Promise<{ hash: string; valor: unknown }>,
    tipo: Linea['tipo'],
    texto: (v: unknown) => string,
    aviso: string,
  ) => {
    if (idFusible === null) return
    setPaso(aviso)
    try {
      const r = await fn()
      anotar({ tipo, texto: texto(r.valor), hash: r.hash })
      await cargar(idFusible)
    } catch (e) {
      setFallo((e as ErrorContrato).message)
    } finally {
      setPaso(null)
    }
  }

  // ---- render ----

  if (cargando) {
    return (
      <section className="tarjeta centrada">
        <h2>Leyendo la red…</h2>
        <p className="ayuda">Buscando fusibles en el contrato.</p>
      </section>
    )
  }

  if (!estado || creando) {
    return (
      <>
        <BarraFirmante
          firmante={firmante}
          disponible={freighterDisponible}
          onConectar={() => void conectar()}
        />
        <FormularioRed
          onCrear={crear}
          paso={paso}
          fallo={fallo}
          onCancelar={estado ? () => setCreando(false) : undefined}
        />
      </>
    )
  }

  const tope = aUnidades(estado.tope_total)
  const gastado = aUnidades(estado.gastado)
  const porOp = aUnidades(estado.tope_por_op)
  const remanente = aUnidades(estado.fondeado - estado.gastado)
  const usado = tope === 0 ? 0 : Math.min(100, (gastado / tope) * 100)
  const bloqueado = estado.cortado || paso !== null

  const esMio = firmante.direccion === estado.owner

  return (
    <>
      <BarraFirmante
        firmante={firmante}
        disponible={freighterDisponible}
        onConectar={() => void conectar()}
      />
      <main className="tablero">
      <div className="columna">
        <section className="tarjeta">
          <div className="fila-titulo">
            <h2>Fusible #{estado.id}</h2>
            <span className={`estado ${estado.cortado ? 'cortado' : 'activo'}`}>
              {estado.cortado ? 'Cortado' : 'Activo'}
            </span>
          </div>

          <p className="ayuda">
            Datos leídos del contrato{' '}
            <a href={urlContrato()} target="_blank" rel="noreferrer">
              en la red de pruebas
            </a>
            . Nada de esta pantalla está simulado.
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
            <small>Quedan {money(Math.max(0, tope - gastado))} XLM por gastar</small>
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
              <dd>
                {new Date(Number(estado.vigencia_hasta) * 1000).toLocaleDateString('es-CO')}
              </dd>
            </div>
            <div>
              <dt>Agente</dt>
              <dd>
                <code>{corto(estado.agent)}</code>
              </dd>
            </div>
          </dl>

          <div className="acciones">
            <button
              className="boton peligro"
              disabled={bloqueado || !esMio}
              onClick={() =>
                void accionDueno(
                  () => cortar(firmante, estado.id),
                  'cortado',
                  () => 'Fusible cortado',
                  'Cortando el acceso del agente…',
                )
              }
            >
              Cortar ahora
            </button>
            <button
              className="boton"
              disabled={paso !== null || remanente <= 0 || !esMio}
              onClick={() =>
                void accionDueno(
                  () => retirar(firmante, estado.id),
                  'retiro',
                  (v) => `Remanente retirado · ${money(aUnidades(v as bigint))} XLM`,
                  'Devolviendo el remanente…',
                )
              }
            >
              Retirar remanente ({money(Math.max(0, remanente))} XLM)
            </button>
            <button
              className="boton fantasma"
              disabled={paso !== null}
              onClick={() => setCreando(true)}
            >
              Crear otro fusible
            </button>
          </div>

          {!esMio && (
            <p className="nota">
              Este fusible es de <code>{corto(estado.owner)}</code>, no de la
              billetera que estás usando. Puedes verlo y dejar que el agente
              opere, pero solo su dueño puede cortarlo o retirar el remanente.
              Crea uno tuyo para probar esas acciones.
            </p>
          )}
          {estado.cortado && (
            <p className="nota">
              El corte es definitivo: no existe ninguna función que lo reactive.
            </p>
          )}
        </section>

        <section className="tarjeta consola">
          <h2>Agente de demostración</h2>
          <p className="ayuda">
            Cada botón arma una transacción real, la firma con la llave del
            agente <code>{corto(AGENTE_ID)}</code> y la envía a la red.
          </p>

          <div className="botones">
            <button
              className="boton"
              disabled={bloqueado}
              onClick={() => void intentarPago(DESTINOS[0].direccion, 1, DESTINOS[0].alias)}
            >
              Pagar 1 XLM a {DESTINOS[0]?.alias}
              <small>Dentro de las reglas: debería pasar</small>
            </button>

            <button
              className="boton"
              disabled={bloqueado}
              onClick={() =>
                void intentarPago(DESTINOS[0].direccion, porOp + 5, DESTINOS[0].alias)
              }
            >
              Pagar {money(porOp + 5)} XLM (el tope por operación es {money(porOp)})
              <small>El contrato debería rechazarlo</small>
            </button>

            <button
              className="boton"
              disabled={bloqueado}
              onClick={() =>
                void intentarPago(DESTINO_HOSTIL.direccion, 1, DESTINO_HOSTIL.alias)
              }
            >
              Pagar 1 XLM a una dirección desconocida
              <small>Hay saldo, pero el destino no está autorizado</small>
            </button>
          </div>

          {paso && <p className="nota corriendo">{paso}</p>}
          {fallo && <p className="nota error">{fallo}</p>}
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
          Cada operación ejecutada deja un hash que cualquiera puede verificar.
          Los rechazos los detiene el contrato en la simulación, antes de
          gastar comisión, así que no generan transacción.
        </p>

        <ol className="eventos">
          {lineas.map((l) => (
            <li key={l.id} className={ETIQUETA_TIPO[l.tipo]}>
              <span className="hora">{hora(l.momento)}</span>
              <div className="cuerpo">
                <strong>{l.texto}</strong>
                {l.detalle && <p className="motivo">{l.detalle}</p>}
                {l.hash && (
                  <a className="destino-ev" href={urlTx(l.hash)} target="_blank" rel="noreferrer">
                    ver en el explorador ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
      </main>
    </>
  )
}

function BarraFirmante({
  firmante,
  disponible,
  onConectar,
}: {
  firmante: Firmante
  disponible: boolean
  onConectar: () => void
}) {
  return (
    <div className="firmante">
      <span className="punto" aria-hidden="true" />
      <span>
        Firmando como <code>{corto(firmante.direccion)}</code> con{' '}
        <strong>{firmante.etiqueta}</strong>
      </span>
      {!firmante.esFreighter &&
        (disponible ? (
          <button className="enlace" onClick={onConectar}>
            Conectar mi billetera
          </button>
        ) : (
          <a href="https://www.freighter.app" target="_blank" rel="noreferrer">
            Instalar Freighter para usar la tuya ↗
          </a>
        ))}
    </div>
  )
}

function FormularioRed({
  onCrear,
  paso,
  fallo,
  onCancelar,
}: {
  onCrear: (t: number, p: number, h: number, d: number) => Promise<void>
  paso: string | null
  fallo: string | null
  onCancelar?: () => void
}) {
  const [topeTotal, setTopeTotal] = useState('100')
  const [topePorOp, setTopePorOp] = useState('15')
  const [horas, setHoras] = useState('720')

  const t = Number(topeTotal)
  const p = Number(topePorOp)
  const valido = t > 0 && p > 0 && p <= t && Number(horas) > 0

  return (
    <section className="tarjeta">
      <span className="paso">Crear un fusible en la red de pruebas</span>
      <h2>Define el límite</h2>
      <p className="ayuda">
        Esto crea un fusible nuevo en el contrato y le deposita el
        presupuesto. Son dos transacciones reales y tardan unos segundos. Una
        vez creado, estas reglas no las puede cambiar nadie.
      </p>

      <div className="campos">
        <label>
          Tope total
          <div className="monto">
            <input
              type="number"
              min="1"
              value={topeTotal}
              onChange={(e) => setTopeTotal(e.target.value)}
              disabled={paso !== null}
            />
            <span>XLM</span>
          </div>
          <small>Se deposita completo. Es la pérdida máxima posible</small>
        </label>

        <label>
          Tope por operación
          <div className="monto">
            <input
              type="number"
              min="1"
              value={topePorOp}
              onChange={(e) => setTopePorOp(e.target.value)}
              disabled={paso !== null}
            />
            <span>XLM</span>
          </div>
          <small>Lo máximo en un solo pago</small>
        </label>

        <label>
          Vigencia
          <div className="monto">
            <input
              type="number"
              min="1"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              disabled={paso !== null}
            />
            <span>horas</span>
          </div>
          <small>Después de esto no paga más</small>
        </label>
      </div>

      <fieldset className="destinos">
        <legend>Destinos permitidos</legend>
        <p className="ayuda">
          El agente solo podrá pagarle a estas direcciones. Cualquier otra se
          rechaza, aunque quede saldo.
        </p>
        {DESTINOS.map((d) => (
          <div key={d.direccion} className="destino">
            <span className="alias">{d.alias}</span>
            <code>{corto(d.direccion)}</code>
          </div>
        ))}
      </fieldset>

      <button
        className="boton primario"
        disabled={!valido || paso !== null}
        onClick={() => void onCrear(t, p, Number(horas), t)}
      >
        {paso ?? `Crear el fusible y depositar ${topeTotal} XLM`}
      </button>

      {onCancelar && !paso && (
        <button className="boton fantasma" onClick={onCancelar}>
          Volver al fusible actual
        </button>
      )}

      {fallo && <p className="nota error">{fallo}</p>}
    </section>
  )
}
