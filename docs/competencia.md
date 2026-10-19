# Alternativas que ya existen

**Fecha de la revisión:** 13 de octubre de 2026

Este documento existe porque la revisión se hizo tarde. Hasta la semana 3,
el proyecto asumía que no había soluciones al problema del gasto acotado en
programas autónomos. **Esa premisa era falsa**, y los entregables de las
semanas 1 a 3 la daban por buena. Aquí queda el hallazgo y la corrección.

---

## Qué existe hoy

| Producto | Qué ofrece | Estado |
|---|---|---|
| **AWS Bedrock AgentCore Payments** | Wallet, firma, límites de gasto y registro de auditoría para agentes. Soporta x402. El agente puede pedir pagos pero no leer ni modificar su propio límite | Disponible desde agosto de 2026 |
| **Privy** | Límites de transferencia, allowlists de contratos y destinatarios, ventanas temporales | En producción |
| **Openfort** | Session keys on-chain con tope de gasto, allowlist y ventana, dentro de la smart account | En producción |
| **OpenZeppelin, sobre Stellar** | Smart accounts con reglas programables para límites de gasto, umbrales multifirma y permisos acotados para recursos x402 | Desarrollo activo |

La última fila es la más relevante: hay trabajo en la propia red que elegimos,
apuntando al mismo problema.

## Qué tan grande es el mercado

x402 dejó de ser una especificación. En abril de 2026 la Linux Foundation
formalizó la **x402 Foundation**, con Visa, Mastercard, Stripe, Google y AWS
entre sus miembros fundadores. MPP lanzó en marzo de 2026 con más de cien
servicios integrados. Ambos protocolos están vivos en Stellar mainnet.

El supuesto 2 del Problem Brief —que existan proveedores cobrando por
consumo— se sostiene mejor de lo que asumimos. El problema no es que el
mercado no exista: es que está siendo atendido.

---

## Verificado contra documentación oficial

| Afirmación | Fuente | Estado |
|---|---|---|
| Coinbase CDP cobra USD 0,005 por operación de wallet | [Precios CDP](https://docs.cdp.coinbase.com/wallets/pricing) | Confirmado |
| **Las primeras 5.000 operaciones mensuales son gratuitas** | [Precios CDP](https://docs.cdp.coinbase.com/wallets/pricing) | Confirmado |
| AgentCore Payments no cobra nada propio; el costo es del proveedor de wallet | [Precios AgentCore](https://aws.amazon.com/bedrock/agentcore/pricing/) | Confirmado |
| Usar Coinbase exige suscripción en AWS Marketplace, sin cargo adicional | [Prerequisitos](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments-prerequisites.html) | Confirmado |
| Las wallets de Coinbase se configuran como **no custodiales**, con firma delegada; Privy ofrece wallets propiedad del usuario | [Prerequisitos](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments-prerequisites.html) | Confirmado |
| El mínimo de red en Stellar es 100 stroops (0,00001 XLM) por operación | [Tarifas Stellar](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) | Confirmado |
| Una transacción de contrato Soroban paga **Resource Fee + Inclusion Fee** | [Tarifas Stellar](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) | Confirmado |

## Medido el 19 de octubre: el costo nos desfavorece

**Un pago del agente cuesta 0,0792 XLM** — unos USD 0,0141 con XLM a 0,178.
AgentCore cuesta USD 0,005 por operación y regala las primeras 5.000 del mes.

**Fusible es ~2,8 veces más caro, y gratis-contra-algo por debajo de 5.000
operaciones mensuales.** El detalle y el método están en
[`costos.md`](costos.md).

Esto elimina el argumento de costo. Lo que queda es la diferencia
arquitectónica: el límite y el registro no los administra ninguna de las
partes.

## Sin verificar
- **Cuántas operaciones de wallet consume un pago vía AgentCore.** AWS dice
  que `ProcessPayment` cuenta como una; la tabla de Coinbase dice que enviar
  una transacción son dos. No está resuelto.
- Las tarifas de Stripe Privy.
- La tracción real de AgentCore Payments, más allá de "más de 1.000 pagos"
  reportados en beta.
- Si el nicho de la sección siguiente existe como mercado.

---

## Qué sigue siendo distinto en Fusible

Tres diferencias reales, ordenadas por cuánto resisten:

**1. El registro no pertenece a ninguna de las partes.** AgentCore entrega
un registro de auditoría, pero vive en la cuenta de AWS de quien opera el
agente. Los eventos de un contrato los lee cualquiera sin pedir permiso.
Esta es la única diferencia que no se cierra con un cambio de configuración
del competidor, porque es arquitectónica.

**2. No hay proveedor del que depender.** AgentCore exige cuenta de AWS,
credenciales de Coinbase o Privy y una suscripción en Marketplace. Un
contrato desplegado sigue funcionando sin nadie detrás.

**3. La gobernanza es portátil.** El control de gasto de AgentCore está
atado a la cuenta de AWS; el de un contrato vive en la red.

### Dónde importan esas diferencias

En un solo caso con forma de negocio: **cuando quien gasta y quien debe
rendir cuentas son partes distintas.** Una agencia que opera agentes para un
cliente no puede demostrarle cuánto gastó enseñándole su propio panel de
AWS — es su palabra contra nada. Ahí un registro que ninguna de las dos
controla sí resuelve algo.

**Es una hipótesis, no un hallazgo.** No hay ninguna entrevista que la
respalde.

## Qué resultó ser falso

| Lo que decíamos | Por qué es falso |
|---|---|
| "Ningún proveedor puede resolverlo: exigiría que quien cobra se autolimite" | AWS y Stripe construyeron ese freno |
| "Es el único que detiene en vez de avisar" | AgentCore también deniega el pago al alcanzar el presupuesto |
| "La parte que nos interesa es justamente la que no existe" | Existe, en al menos cuatro productos |
| El costo por operación de Stellar como ventaja | La comparación mezclaba el piso de Stellar con el costo total del competidor, y omitía las 5.000 operaciones gratuitas de Coinbase |

---

## Qué cambia para el proyecto

**Para el programa:** nada del trabajo hecho se invalida. El problema sigue
siendo real y la solución sigue siendo coherente. Lo que cambia es el
argumento de originalidad, que no se sostiene y se reemplaza por uno de
diferenciación.

**Para una eventual aplicación a financiación:** importa. La pregunta "¿por
qué esto no existe ya?" tiene respuesta, y hay que llegar con ella dada en
vez de esperar a que la hagan.

**Para la viabilidad comercial:** el camino es estrecho. Competir de frente
con AWS no es realista para un proyecto individual sin financiación. El
único ángulo defendible es el nicho multi-parte, y está sin validar.
