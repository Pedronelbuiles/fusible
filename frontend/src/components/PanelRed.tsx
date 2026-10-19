import { useCallback, useEffect, useState } from 'react'
import {
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
  fondear,
  leerDeDueno,
  leerEstado,
  pagar,
  retirar,
} from '../stellar/contrato'
import type { Firmante } from '../stellar/firmante'
import { corto, hora, money } from '../dominio'
import { ModalError, ModalProceso, type PasoProceso } from './Modal'

interface Linea {
  id: number
  tipo: 'pago' | 'bloqueado' | 'creado' | 'fondeado' | 'cortado' | 'retiro'
  texto: string
  detalle?: string
  hash?: string
  momento: number
}

interface Proceso {
  titulo: string
  pasos: PasoProceso[]
}

interface Fallo {
  titulo: string
  mensaje: string
}

export default function PanelRed({ firmante }: { firmante: Firmante }) {
  const [idFusible, setIdFusible] = useState<number | null>(null)
  const [mios, setMios] = useState<number[]>([])
  const [estado, setEstado] = useState<EstadoCadena | null>(null)
  const [cargando, setCargando] = useState(true)
  const [proceso, setProceso] = useState<Proceso | null>(null)
  const [fallo, setFallo] = useState<Fallo | null>(null)
  const [lineas, setLineas] = useState<Linea[]>([])
  const [creando, setCreando] = useState(false)

  const anotar = (l: Omit<Linea, 'id' | 'momento'>) =>
    setLineas((p) => [{ ...l, id: Date.now() + Math.random(), momento: Date.now() }, ...p])

  const cargar = useCallback(async (id: number) => {
    setEstado(await leerEstado(id))
    setIdFusible(id)
  }, [])

  const misIds = useCallback(async (direccion: string) => {
    try {
      return await leerDeDueno(direccion)
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setCargando(true)
      const lista = await misIds(firmante.direccion)
      setMios(lista)
      if (lista.length > 0) {
        try {
          await cargar(lista[lista.length - 1])
        } catch (e) {
          setFallo({ titulo: 'No se pudo leer el contrato', mensaje: String(e) })
        }
      } else {
        setEstado(null)
      }
      setCargando(false)
    })()
  }, [firmante, cargar, misIds])

  // ---- acciones ----

  const crear = async (topeTotal: number, topePorOp: number, horas: number) => {
    const pasos: PasoProceso[] = [
      { texto: 'Crear el fusible con sus reglas', estado: 'activo' },
      { texto: 'Depositar el presupuesto', estado: 'pendiente' },
    ]
    const titulo = 'Creando tu fusible'
    setProceso({ titulo, pasos: [...pasos] })

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

      pasos[0].estado = 'hecho'
      pasos[1].estado = 'activo'
      setProceso({ titulo, pasos: [...pasos] })

      const f = await fondear(firmante, r.valor, aStroops(topeTotal))
      anotar({
        tipo: 'fondeado',
        texto: `Presupuesto depositado · ${money(topeTotal)} XLM`,
        hash: f.hash,
      })

      setMios(await misIds(firmante.direccion))
      await cargar(r.valor)
      setCreando(false)
    } catch (e) {
      setFallo({
        titulo: 'No se pudo crear el fusible',
        mensaje: (e as ErrorContrato).message,
      })
    } finally {
      setProceso(null)
    }
  }

  const intentarPago = async (destino: string, monto: number, etiqueta: string) => {
    if (idFusible === null) return
    setProceso({
      titulo: 'El agente está pagando',
      pasos: [{ texto: `Enviando ${money(monto)} XLM a ${etiqueta}`, estado: 'activo' }],
    })
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
      // Un rechazo por regla es un resultado esperado: va al registro, no a
      // un modal. Solo interrumpe lo que el usuario no espera.
      anotar({
        tipo: 'bloqueado',
        texto: `Pago rechazado · ${money(monto)} XLM`,
        detalle: `${etiqueta} — ${(e as ErrorContrato).message}`,
      })
    } finally {
      setProceso(null)
    }
  }

  const accionDueno = async (
    fn: () => Promise<{ hash: string; valor: unknown }>,
    tipo: Linea['tipo'],
    texto: (v: unknown) => string,
    titulo: string,
    paso: string,
  ) => {
    if (idFusible === null) return
    setProceso({ titulo, pasos: [{ texto: paso, estado: 'activo' }] })
    try {
      const r = await fn()
      anotar({ tipo, texto: texto(r.valor), hash: r.hash })
      await cargar(idFusible)
    } catch (e) {
      setFallo({ titulo, mensaje: (e as ErrorContrato).message })
    } finally {
      setProceso(null)
    }
  }

  // ---- render ----

  const modales = (
    <>
      {proceso && <ModalProceso titulo={proceso.titulo} pasos={proceso.pasos} />}
      {fallo && (
        <ModalError
          titulo={fallo.titulo}
          mensaje={fallo.mensaje}
          onCerrar={() => setFallo(null)}
        />
      )}
    </>
  )

  if (cargando) {
    return (
      <section className="tarjeta centrada">
        <h2>Leyendo la red…</h2>
        <p className="ayuda">Buscando tus fusibles en el contrato.</p>
      </section>
    )
  }

  if (!estado || creando) {
    return (
      <>
        {mios.length > 0 && (
          <Selector
            mios={mios}
            actual={null}
            bloqueado={proceso !== null}
            onElegir={(n) => {
              setCreando(false)
              void cargar(n)
            }}
            onNuevo={() => setCreando(true)}
          />
        )}
        <Formulario
          onCrear={crear}
          ocupado={proceso !== null}
          onCancelar={estado ? () => setCreando(false) : undefined}
          primero={mios.length === 0}
        />
        {modales}
      </>
    )
  }

  const esMio = firmante.direccion === estado.owner
  const tope = aUnidades(estado.tope_total)
  const gastado = aUnidades(estado.gastado)
  const porOp = aUnidades(estado.tope_por_op)
  const remanente = aUnidades(estado.fondeado - estado.gastado)
  const usado = tope === 0 ? 0 : Math.min(100, (gastado / tope) * 100)
  const ocupado = proceso !== null
  const sinPagos = estado.cortado || ocupado

  return (
    <>
      <Selector
        mios={mios}
        actual={idFusible}
        bloqueado={ocupado}
        onElegir={(n) => void cargar(n)}
        onNuevo={() => setCreando(true)}
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
              Leído del contrato{' '}
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
                disabled={sinPagos || !esMio}
                onClick={() =>
                  void accionDueno(
                    () => cortar(firmante, estado.id),
                    'cortado',
                    () => 'Fusible cortado',
                    'Cortando el fusible',
                    'Dejándolo inutilizable, para siempre',
                  )
                }
              >
                Cortar ahora
              </button>
              <button
                className="boton"
                disabled={ocupado || remanente <= 0 || !esMio}
                onClick={() =>
                  void accionDueno(
                    () => retirar(firmante, estado.id),
                    'retiro',
                    (v) => `Remanente retirado · ${money(aUnidades(v as bigint))} XLM`,
                    'Devolviendo el remanente',
                    'Enviando lo que no se gastó de vuelta a tu billetera',
                  )
                }
              >
                Retirar remanente ({money(Math.max(0, remanente))} XLM)
              </button>
            </div>

            {!esMio && (
              <p className="nota">
                Este fusible es de <code>{corto(estado.owner)}</code>, no de la
                billetera con la que entraste. Puedes verlo y dejar que el
                agente opere, pero solo su dueño puede cortarlo o retirar el
                remanente.
              </p>
            )}
            {estado.cortado && (
              <p className="nota">
                El corte es definitivo: no existe ninguna función que lo
                reactive.
              </p>
            )}
          </section>

          <section className="tarjeta consola">
            <h2>Agente de demostración</h2>
            <p className="ayuda">
              Cada botón arma una transacción real, la firma con la llave del
              agente <code>{corto(estado.agent)}</code> y la envía a la red.
            </p>

            <div className="botones">
              <button
                className="boton"
                disabled={sinPagos}
                onClick={() => void intentarPago(DESTINOS[0].direccion, 1, DESTINOS[0].alias)}
              >
                Pagar 1 XLM a {DESTINOS[0]?.alias}
                <small>Dentro de las reglas: debería pasar</small>
              </button>

              <button
                className="boton"
                disabled={sinPagos}
                onClick={() =>
                  void intentarPago(DESTINOS[0].direccion, porOp + 5, DESTINOS[0].alias)
                }
              >
                Pagar {money(porOp + 5)} XLM (el tope por operación es {money(porOp)})
                <small>El contrato debería rechazarlo</small>
              </button>

              <button
                className="boton"
                disabled={sinPagos}
                onClick={() =>
                  void intentarPago(DESTINO_HOSTIL.direccion, 1, DESTINO_HOSTIL.alias)
                }
              >
                Pagar 1 XLM a una dirección desconocida
                <small>Hay saldo, pero el destino no está autorizado</small>
              </button>
            </div>
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
            Cada operación ejecutada deja un hash que cualquiera puede
            verificar. Los rechazos los detiene el contrato antes de gastar
            comisión, así que no generan transacción.
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

      {modales}
    </>
  )
}

function Selector({
  mios,
  actual,
  bloqueado,
  onElegir,
  onNuevo,
}: {
  mios: number[]
  actual: number | null
  bloqueado: boolean
  onElegir: (n: number) => void
  onNuevo: () => void
}) {
  return (
    <nav className="mis-fusibles">
      <span>Mis fusibles</span>
      {mios.map((n) => (
        <button
          key={n}
          className={n === actual ? 'activo' : ''}
          disabled={bloqueado}
          onClick={() => onElegir(n)}
        >
          #{n}
        </button>
      ))}
      <button className="nuevo" disabled={bloqueado} onClick={onNuevo}>
        + nuevo
      </button>
    </nav>
  )
}

function Formulario({
  onCrear,
  ocupado,
  onCancelar,
  primero,
}: {
  onCrear: (t: number, p: number, h: number) => Promise<void>
  ocupado: boolean
  onCancelar?: () => void
  primero: boolean
}) {
  const [topeTotal, setTopeTotal] = useState('10')
  const [topePorOp, setTopePorOp] = useState('2')
  const [horas, setHoras] = useState('720')

  const t = Number(topeTotal)
  const p = Number(topePorOp)
  const valido = t > 0 && p > 0 && p <= t && Number(horas) > 0

  return (
    <section className="tarjeta">
      <span className="paso">{primero ? 'Tu primer fusible' : 'Crear otro fusible'}</span>
      <h2>Define el límite</h2>
      <p className="ayuda">
        Esto crea un fusible en el contrato y le deposita el presupuesto. Son
        dos transacciones reales. Una vez creado, estas reglas no las puede
        cambiar nadie, tampoco tú.
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
              disabled={ocupado}
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
              disabled={ocupado}
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
              disabled={ocupado}
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
        disabled={!valido || ocupado}
        onClick={() => void onCrear(t, p, Number(horas))}
      >
        Crear el fusible y depositar {topeTotal} XLM
      </button>

      {onCancelar && !ocupado && (
        <button className="boton fantasma" onClick={onCancelar}>
          Volver al fusible actual
        </button>
      )}
    </section>
  )
}
