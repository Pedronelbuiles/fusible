# Fusible

**Un presupuesto con límites para programas de inteligencia artificial que
pagan solos.**

La forma más común de que un programa autónomo pague por lo que consume es
entregarle una credencial con un medio de pago detrás y sin techo: la
credencial responde "quién eres", nunca "hasta cuánto".

Ya existen productos que ponen ese límite —AWS AgentCore Payments, Privy,
Openfort—, pero en todos el límite y el registro los administra un
proveedor, y ese registro vive en la cuenta de quien opera el agente. Si
quien gasta y quien debe rendir cuentas son partes distintas, eso no
alcanza. El análisis completo está en [`competencia.md`](competencia.md).

Fusible es ese límite sin administrador: un contrato que guarda el
presupuesto de un programa y lo libera solo bajo reglas que ni el programa
ni su autor pueden cambiar después, y que deja un registro que ninguna de
las partes controla.

---

## Qué hace

| | |
|---|---|
| **Tope total y por operación** | La pérdida máxima queda definida antes de soltar el programa |
| **Lista de destinos permitidos** | Solo se puede pagar a direcciones autorizadas de antemano |
| **Corte en caliente** | El dueño detiene el gasto de forma inmediata e irreversible |
| **Registro independiente** | Cada pago y cada intento bloqueado quedan registrados fuera del control de las partes |

---

## Dónde verlo

Front desplegado: <https://fusible101.vercel.app>

## Estado

Proyecto en desarrollo dentro de **Blockchain Builders 101**, programa de
Blockchain Acceleration Foundation, Ruta N Medellín y Stellar
(22 de septiembre – 26 de octubre de 2026).

| Semana | Entregable | Estado |
|---|---|---|
| 1 | Problem brief | Entregado |
| 2 | Product blueprint | Entregado |
| 3 | Functional proof | Entregado |
| 4 | Validated MVP | Entregado |
| 5 | Demo package | Pendiente |

---

## Estructura

```
contracts/           Contrato `fusible` en Soroban (Rust)
frontend/            Interfaz del producto (Vite + React + TypeScript)
docs/
├── competencia.md   Alternativas que ya existen y qué sigue siendo distinto
├── costos.md        Cuánto cuesta cada operación, medido
├── recuperacion.md  Cómo volver a levantarlo si la testnet se reinicia
├── roadmap.md       Qué sigue, antes y después del cierre
├── entrevistas/     Notas de validación con usuarios
├── proyecto.md      Este documento
├── semana1/         Problem brief y propuesta individual
├── semana2/         Product blueprint, historias, lean canvas y arquitectura
├── semana3/         Documentación del front y decisión técnica
├── semana4/         MVP funcional y evidencia en testnet
└── semana5/         Demo package
```

El contrato está desplegado en testnet:
[CDY34ZUL…6OPUNA733](https://stellar.expert/explorer/testnet/contract/CDY34ZULKDNOVCAGKXTCU7HE6SCAUOSQ4B5T7V4RMP7FYYU6OPUNA733)

**Empieza por** [`semana1/ProblemBrief.md`](semana1/ProblemBrief.md). Para
correr el proyecto, ver el [README](../README.md).

---

## Equipo

Pedro Nel Builes Moreno — proyecto individual, autorizado por el equipo
académico del programa.

---

## Herramientas de asistencia

La documentación de este repositorio se elaboró con apoyo de un asistente de
IA (Claude Code), usado para estructurar, redactar y revisar los textos a
partir del material del programa, de la experiencia del autor y de las
fuentes citadas en cada sección.

Las decisiones de producto —el problema elegido, los criterios con los que
se descartaron las demás propuestas, la hipótesis y el alcance— son del
autor, que revisa y asume el contenido publicado. La totalidad de los
commits son de su autoría.

El código que se incorpore a partir de la semana 3 declarará en este mismo
apartado el uso de asistencia, plantillas o código de terceros cuando
aplique.

---

## Licencia

MIT. Ver [LICENSE](../LICENSE).
