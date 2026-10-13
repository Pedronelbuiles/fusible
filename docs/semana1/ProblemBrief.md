# Problem Brief

## Decisión del problema

### Problema elegido

> El problema ganador en una frase, sin mencionar blockchain, y quién lo propuso.

**Quien construye un programa de inteligencia artificial que actúa por su
cuenta no tiene forma de darle dinero con límites: la única opción hoy es
entregarle una credencial con un medio de pago detrás y gasto ilimitado, y
si el programa falla o alguien lo manipula, el daño solo se descubre cuando
llega la factura.**

Propuesto por Pedro Nel Builes Moreno
(`docs/semana1/PedroBuiles.md`).

### Por qué elegimos este

> Qué inclinó al equipo por este problema frente a los demás, según los criterios de la Sesión 1.

Tres razones, en orden de peso.

**Es el único de los candidatos que cumple los tres criterios de pertinencia
de la Sesión 1 sin forzar el argumento.** Varias partes que no confían entre
sí necesitan el mismo registro de gasto; el histórico tiene que ser
inalterable justamente porque su propósito es servir de evidencia ante un
incidente; y hay un intermediario —la pasarela de pagos— que existe solo
para concentrar confianza y que, al cobrar un porcentaje por transacción,
vuelve imposible el pago por consumo que un proceso automático necesita.

**Es un problema conocido de cerca, y ya documentado.** La Sesión 1 fue
explícita: el mejor problema es uno que se vivió o se vio de cerca. Trabajo
a diario con sistemas de IA en producción y esta limitación aparece cada vez
que se intenta dejar un proceso operando sin supervisión. Además ya existe
al menos un caso público con cifras, reseñado en la sección de evidencia.

**El problema está creciendo, no desapareciendo.** La documentación oficial
de Stellar ya incluye protocolos de pagos entre programas automáticos
(x402 y MPP). Que el ecosistema esté construyendo el carril de pago confirma
que el problema es reconocido, y deja ver que la pieza de control y límites
sobre ese carril todavía está abierta.

### Propuestas descartadas

> Cada propuesta considerada, quién la propuso y el motivo del descarte.

Todas las propuestas fueron formuladas y evaluadas por Pedro Builes, dado
que el proyecto se desarrolla de forma individual (ver *Cómo tomamos la
decisión*).

| Propuesta | Motivo del descarte |
|---|---|
| **Factoring de facturas electrónicas para PYMEs** — adelantar el pago de cuentas por cobrar registradas en RADIAN | Cumple los tres criterios y tiene el mayor potencial económico, pero exige un pagador ancla institucional que acepte participar. Conseguirlo no depende del equipo y sin él no hay a quién validarle nada en cinco semanas |
| **Cartera hospitalaria EPS → IPS** — conciliación y adelanto de cartera en salud | El dolor es enorme y está desatendido, pero el ciclo de venta es institucional. Sin un contacto dentro de una IPS o EPS, la validación con usuarios de la semana 4 sería imposible |
| **Escrow por hitos para exportadores de servicios** — pagos a freelancers y software factories | Fue el finalista. Se descartó porque compite directamente con el ejemplo de remesas usado en la Sesión 1 y porque su argumento principal, reducir costo y tiempo, es de eficiencia. El criterio de pertinencia se sostiene peor que en el problema elegido |
| **Anticipo de cosecha para caficultores** | El último kilómetro es en efectivo y exige una cooperativa aliada real. Además, el café fue el ejemplo usado en clase: alta probabilidad de solaparse con otros equipos |
| **Reparto automático de un pago entre varios beneficiarios** | Criterios de pertinencia sólidos y técnicamente simple, pero como producto es un componente, no un problema. Queda disponible como pieza del proyecto elegido |
| **Fondos comunitarios / natilleras digitales** | Criterios sólidos y arraigo cultural, pero sin modelo de sostenimiento y con riesgo reputacional alto si falla con dinero de personas reales |
| **Credenciales verificables** | BAF ya financió una solución de este tipo en el programa GIVE Colombia. Repetirlo compite contra un referente del propio ecosistema |
| **Escrow para marketplaces informales** | El problema es real y masivo, pero el usuario final no tiene billetera digital ni interés en tenerla. El costo de incorporación hunde el MVP |

### Cómo tomamos la decisión

> Cómo llegó el equipo al acuerdo: votación, consenso tras debate u otro.

El proyecto se desarrolla de forma **individual**, con autorización previa
del equipo académico. No hubo conformación de equipo, por lo que no aplicó
votación ni consenso grupal.

En reemplazo de la deliberación entre personas, la decisión se tomó
aplicando un filtro explícito y documentado a las ocho propuestas de la
tabla anterior. Cada una se evaluó contra cinco condiciones: que cumpliera
al menos dos de los tres criterios de pertinencia de la Sesión 1; que el
dolor fuera cuantificable en dinero o en tiempo; que existiera alguien
entrevistable dentro de la primera semana; que el alcance fuera construible
y demostrable en el tiempo restante del programa; y que no coincidiera con
los ejemplos usados en clase, para evitar solaparse con otros equipos.

Solo dos propuestas pasaron las cinco condiciones: el escrow por hitos para
exportadores de servicios y el control de presupuesto para programas
autónomos. Entre ellas decidió el criterio de pertinencia: el escrow se
sostiene principalmente sobre un argumento de eficiencia —cuesta menos,
tarda menos—, mientras que el problema elegido se sostiene sobre confianza y
sobre la imposibilidad de que una de las partes sea a la vez quien cobra y
quien lleva el registro. La Sesión 1 fue clara en que lo que cambia no es el
costo, sino la confianza.

---

## Problem Brief

### Encabezado

> Nombre del proyecto y una frase que describa el problema. Extensión: breve.

**Proyecto: Fusible**

Un programa de inteligencia artificial que puede pagar no tiene hoy un
límite que lo detenga, ni un registro de lo que gastó que no pertenezca a
quien le cobró.

Fusible es un presupuesto con reglas para programas autónomos: un tope que
ni el programa ni su autor pueden modificar después, una lista cerrada de
destinos permitidos, un interruptor de corte inmediato y un registro público
de cada pago y cada intento bloqueado.

### Equipo y roles

> Integrantes con su usuario de GitHub, rol asumido por cada persona, responsable de las entregas y canal de coordinación interna. Extensión: breve.

| Integrante | GitHub | Rol |
|---|---|---|
| Pedro Nel Builes Moreno | [@Pedronelbuiles](https://github.com/Pedronelbuiles) | Producto, contrato, interfaz y documentación |

**Modalidad:** proyecto individual, autorizado por el equipo académico. Todos
los roles son asumidos por la misma persona.

**Responsable de las entregas:** Pedro Builes.

**Canal de coordinación:** al no haber equipo, la coordinación interna se
reemplaza por el registro público del repositorio. Cada avance queda como
commit fechado, y la bitácora semanal en `docs/semanaN/` documenta
decisiones, bloqueos y cambios de rumbo. La comunicación con el programa se
hace por el Discord oficial y las asesorías de los viernes.

### Problema y evidencia

> Enunciado del problema en una frase, sin mencionar blockchain. Contexto, frecuencia y alcance. Evidencia mínima de que el problema existe. Extensión: 150–300 palabras.

**Enunciado:** quien construye un programa de inteligencia artificial que
actúa por su cuenta no puede darle dinero con límites, y si el programa falla
o alguien lo manipula, el daño solo se descubre cuando llega la factura.

**Contexto.** Los programas de IA pasaron de responder preguntas a ejecutar
tareas, y los servicios que consumen se cobran por uso. Para
operar sin supervisión necesitan poder pagar, y hoy eso significa
entregarles una credencial conectada a un medio de pago que no admite un
tope real.

**Frecuencia y alcance.** No es un incidente ocasional sino una condición
permanente: aparece cada vez que alguien deja un proceso automático
operando solo. Afecta desde un proyecto personal hasta un área
de tecnología con decenas de procesos.

**Evidencia.**

1. *Caso público documentado.* Un agente autónomo, JertLinc3522, desplegó
   por su cuenta cinco instancias de cómputo en AWS y acumuló una factura de
   **USD 6.531 en cerca de un día**. Su operador no lo detectó: fue la
   comunidad del proyecto la que advirtió la infraestructura levantada. Terminó pidiendo donaciones para cubrir el cargo, alegando que
   el error lo cometió la IA
   ([Decrypt](https://decrypt.co/es/371111/agente-ia-autonomo-aws-6531-dolares-donaciones-cripto)).
   Sin tope, sin detección propia y sin responsable claro.

2. *Experiencia directa.* Trabajo con sistemas de IA en producción, donde la
   restricción es la misma: la credencial que habilita el gasto no admite
   límite y el consumo se conoce al cierre de la facturación.

3. *Fuentes del ecosistema.* Stellar documenta protocolos de pago entre
   programas automáticos,
   [x402](https://developers.stellar.org/docs/build/agentic-payments/x402) y
   [MPP](https://developers.stellar.org/docs/build/agentic-payments/mpp).
   Las pasarelas tradicionales, en cambio, cobran del orden de 2.9% más una
   tarifa fija, lo que vuelve inviable el pago por consumo.

4. *Validación pendiente.* Las entrevistas quedan para la semana 2
   (guía en `docs/entrevistas/cuestionario.md`). Esta semana el
   problema se sostiene sobre un caso público y experiencia directa, no
   sobre evidencia de campo propia.

### Usuario y actores

> Quién sufre el problema y qué necesita resolver. Cómo lo resuelve hoy y qué le cuesta. Demás actores que intervienen. Extensión: 150–300 palabras.

**Usuario.** Daniel, 34 años, líder técnico en una empresa de software en
Medellín. Tiene tres procesos de IA en producción que consultan servicios de
pago por uso. Él aprueba el presupuesto de infraestructura y él responde
cuando el consumo se dispara. Lo que necesita es poder dejar esos procesos
operando sin supervisión, sin que eso signifique aceptar una exposición que
no puede acotar.

**Cómo lo resuelve hoy.** Con una de tres salidas, ninguna satisfactoria. La
primera: no poner límite y revisar la factura al cierre del mes; le cuesta
enterarse hasta treinta días tarde. La segunda: configurar alertas de
consumo; le cuesta que las alertas avisan pero no detienen, así que sirven
para reaccionar, no para prevenir. La tercera: no automatizar y poner a una
persona a aprobar; le cuesta el beneficio completo de la automatización, un
costo que no aparece en ninguna factura y que probablemente es el mayor de
los tres. A eso se suman las horas mensuales de repartir a mano un consumo
consolidado entre equipos, proyectos o clientes.

**Actores.**

| Actor | Papel en el flujo |
|---|---|
| El programa de IA | Decide gastar y ejecuta el pago. No es el usuario: no sufre el problema |
| Proveedor del servicio | Cobra por uso y publica el detalle de consumo |
| Pasarela de pagos y emisor de la tarjeta | Autorizan y procesan el cobro; cobran por transacción |
| Finanzas y contabilidad | Reciben la factura consolidada y la imputan |
| Seguridad y auditoría | Responden ante un incidente y necesitan evidencia que hoy no controlan |

### Flujo actual de valor

> Recorrido paso a paso de cómo se mueve hoy el dinero. Diagrama o secuencia numerada, con los intermediarios explícitos. Señalar si algún paso responde a una obligación normativa. Extensión: 150–300 palabras.

```
01 Daniel crea una credencial          02 La credencial queda en una
   con un medio de pago detrás    -->     variable de entorno del proceso
                                                      |
                                                      v
04 El proveedor acumula el         <--  03 El programa consume y gasta,
   consumo del periodo                     sin registro propio verificable
   |
   v
05 Pasarela y emisor procesan      -->  06 Llega la factura consolidada,
   y cobran por transacción               hasta 30 días después
                                                      |
                                                      v
08 Reparte a mano el consumo       <--  07 Revisa el detalle en el portal
   entre equipos o clientes                del proveedor
```

**Intermediarios explícitos.** Entre el paso 03 y el 06 intervienen tres
partes que no producen valor para el usuario: la pasarela de pagos, la red
de tarjetas y el banco emisor. Su función es exclusivamente dar confianza y
garantizar el cobro, y por ella retienen un porcentaje de cada transacción.

**Pasos con obligación normativa.** El paso 05 está sujeto a normativa: el
procesamiento de datos de tarjeta se rige por el estándar PCI-DSS, y la
emisión de la credencial de pago exige verificación de identidad del titular
por parte del emisor. El paso 06 responde a obligaciones de facturación
fiscal. Estos pasos no se eliminan con tecnología, pero sí cambian de lugar:
la verificación de identidad y la facturación corresponden al titular del
presupuesto, no al programa que gasta. Hoy ambos están fusionados en la
misma credencial, y ese es precisamente el origen del problema.

**Dónde se pierde valor.** En el paso 01 se pierde el control, porque no
existe el concepto de tope. En el 02, la seguridad: quien lea la variable,
gasta. En el 03, la visibilidad. Entre el 04 y el 06, el tiempo. En el 05,
el dinero. En el 07, la independencia de la evidencia. En el 08, el esfuerzo.

### Fricciones identificadas

> Puntos concretos donde el flujo falla, se encarece o se demora. Cada fricción indica en qué paso ocurre, qué la causa y a quién afecta. Extensión: 150–300 palabras.

**F1 — No existe el tope duro.** Ocurre en el paso 01. La causa es que las
credenciales de servicio se diseñaron para autenticar, no para acotar: una
credencial responde "quién eres", nunca "hasta cuánto". Afecta a Daniel, que
no puede delegar sin exponerse sin techo.

**F2 — La credencial es el único control, y es binaria.** Ocurre en el paso
02. La causa es que el permiso de gastar viaja en un secreto que vive en el
entorno del proceso: quien lo obtiene, gasta. Afecta a seguridad, que solo
puede revocar la credencial entera y detener el proceso completo.

**F3 — El gasto se conoce hasta 30 días después.** Ocurre entre los pasos 04
y 06. La causa es el ciclo de facturación consolidada. Afecta a Daniel y a
finanzas: cuando el dato llega, el gasto ya ocurrió por completo.

**F4 — El micropago es inviable.** Ocurre en el paso 05. La causa es la
estructura de costos de la pasarela, con un componente fijo por transacción.
Afecta al proveedor y al usuario: obliga a suscripciones y prepagos en un
caso donde lo natural sería pagar por consumo real.

**F5 — El registro pertenece a quien cobra.** Ocurre en el paso 07. La causa
es que la única fuente de verdad sobre el consumo la publica el proveedor
que facturó. Afecta a auditoría: ante una disputa o un incidente, no hay
contraparte independiente.

**F6 — No hay corte en caliente.** Transversal. La causa es que detener el
gasto exige intervenir la credencial o el proceso. Afecta a seguridad, que
ante un programa comprometido no tiene un interruptor inmediato.

**F7 — La imputación es manual.** Ocurre en el paso 08. La causa es que la
factura llega consolidada y sin trazabilidad por proceso. Afecta a finanzas.

### Oportunidad e hipótesis

> Oportunidad priorizada entre las fricciones identificadas, con el motivo de la elección. Hipótesis inicial. Extensión: 150–300 palabras.

**Oportunidad priorizada: F1, la inexistencia de un tope duro**, junto con
sus dos consecuencias directas, F2 y F6: la imposibilidad de acotar y la
imposibilidad de cortar.

**Por qué esta y no otra.** Primero, porque es la causa y no el síntoma: con
un tope real que detiene de verdad, el desfase de treinta días de F3 deja de
ser peligroso, porque la pérdida máxima ya está definida de antemano.
Segundo, porque el control tiene que vivir fuera de quien cobra: un tope que
administra el propio proveedor obliga a confiar en él. Existen productos que
ya lo resuelven —ver [`competencia.md`](../competencia.md)—, y en todos el
límite lo administra un tercero. Tercero, porque cambia la categoría del
problema. Atacar F3 o F7 es hablar de eficiencia y de ahorro; atacar F1 es
hablar de contención de daño. Un programa autónomo manipulado y con
capacidad de pagar no es un problema de sobrecosto, es un incidente de
seguridad, y hoy la única defensa disponible es no darle dinero.

**Hipótesis.** Si el dinero de un programa autónomo vive en un contrato con
reglas que el propio programa no puede modificar —un tope total, un tope por
operación, una lista cerrada de destinos y un interruptor de corte—,
entonces quien lo construye puede dejarlo operar de forma autónoma sin
exponerse a una pérdida sin techo, y el registro de lo que gastó deja de
depender de quien le cobró.

**Qué cambiaría para Daniel.** Hoy elige entre autonomía y control. Con el
fusible deja de tener que elegir: define la pérdida máxima antes de soltar
el proceso, y lo que ocurra después queda dentro de un límite que él fijó y
que nadie puede mover.

### Criterio de pertinencia

> Por qué el caso requiere un registro distribuido y no una base de datos tradicional. Debe apoyarse en al menos uno de los criterios de la Sesión 1. Extensión: 150–300 palabras.

El caso se apoya en los tres criterios, pero el que lo sostiene es el
tercero.

**Intermediario que concentra la confianza.** La pasarela de pagos y la red
de tarjetas no aportan nada a esta cadena salvo confianza, y cobran un
porcentaje más una tarifa fija por ejercerla. Esa estructura es razonable
para una compra de cincuenta dólares y prohibitiva para un pago de un
centavo. El intermediario no solo encarece: elimina el caso de uso.

**Histórico inalterable.** El registro de lo que gastó un programa autónomo
existe para servir de evidencia cuando algo sale mal. Hoy lo publica el
mismo proveedor que facturó, es decir, una de las partes interesadas en la
disputa. Un registro que puede reescribir quien tiene interés en el
resultado no sirve como evidencia.

**Partes que no confían entre sí.** El dueño del presupuesto, el proveedor y
quien audita necesitan la misma versión de los hechos, y hoy cada uno
sostiene la suya.

**Contrafactual honesto.** Una base de datos con un tope resolvería el
control de gasto, y lo haría más rápido y más barato. Hay que decirlo con
claridad: para el problema de *controlar el consumo*, una base de datos
basta. Lo que no resuelve es de quién es esa base de datos. Si la
administra el dueño del presupuesto, el proveedor no tiene por qué aceptar
su versión; si la administra el proveedor, volvemos al punto de partida; y
si la administra un tercero, acabamos de reintroducir al intermediario que
cobra por concentrar la confianza. Con un programa autónomo de por medio,
esa es exactamente la parte que no se puede resolver confiando en alguien.

### Supuestos y riesgos

> Dos o tres supuestos que tendrían que ser ciertos para que la hipótesis funcione, y qué podría invalidarla. Extensión: 150–300 palabras.

**Supuesto 1 — Existe disposición a mover el presupuesto de un proceso a un
activo digital en lugar de una tarjeta.** Es el más frágil: la hipótesis técnica
puede ser impecable y aun así fracasar si el responsable no acepta el cambio
por razones contables, tributarias o de política interna. *Qué lo invalidaría:* que la objeción en las
entrevistas no sea el precio ni la funcionalidad, sino que contabilidad no
lo acepta.

**Supuesto 2 — Hay proveedores dispuestos a cobrar por consumo individual.**
Si todos siguen cobrando por suscripción mensual, el tope pierde utilidad. *Qué lo invalidaría:* que no exista adopción real de x402 o
MPP más allá de la especificación. *Mitigación:* seguiría sirviendo para
acotar recargas periódicas.

**Supuesto 3 — El tope que detiene se prefiere a la alerta que avisa.** Un
corte automático interrumpe un proceso en producción, y para algunos equipos
eso sería peor que el sobrecosto. *Qué lo invalidaría:* que los
entrevistados prefieran el riesgo económico a la interrupción.

**Riesgos de ejecución.** La curva de Rust amenaza el cronograma: se mitiga
empezando el contrato en la semana 2 y usando las asesorías. El usuario es
un perfil técnico, poco inmediato para una audiencia general: se mitiga
contando el problema como seguridad y no como costos.

---

## Árbol de estructura

```
.
├── .gitignore
├── LICENSE
├── README.md
└── docs
    ├── entrevistas
    │   ├── README.md
    │   └── cuestionario.md
    ├── semana1
    │   ├── PedroBuiles.md
    │   └── ProblemBrief.md
    ├── semana2
    ├── semana3
    ├── semana4
    └── semana5
```

| Ruta | Contenido |
|---|---|
| `README.md` | Descripción del proyecto, estado, estructura y declaración de herramientas de asistencia |
| `LICENSE` | Licencia MIT, requisito de participación desde la semana 1 |
| `docs/semana1/PedroBuiles.md` | Propuesta individual (Fase 1 del entregable) |
| `docs/semana1/ProblemBrief.md` | Este documento (Fase 2 del entregable) |
| `docs/entrevistas/cuestionario.md` | Guía de las entrevistas de validación |
| `docs/entrevistas/README.md` | Índice de las entrevistas realizadas |
| `docs/semana2` … `semana5` | Entregables de las semanas siguientes |

> Este árbol refleja el repositorio al cierre de la semana 1. El estado
> actual está en [`docs/proyecto.md`](../proyecto.md): el README pasó a ser
> solo las instrucciones de ejecución, su contenido se movió a ese archivo,
> y se agregaron `frontend/` y [`docs/competencia.md`](../competencia.md).

A partir de la semana 3 se incorpora el código del proyecto: el contrato
en `contracts/fusible/`, la interfaz en `web/` y el programa de
demostración en `agent/`.
