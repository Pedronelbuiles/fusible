# Cuánto cuesta operar un fusible

**Medición:** 19 de octubre de 2026 · Stellar testnet
**Contrato:** `CD2ZSG35QKJGNN4EERA55DW62JEWFB567TJYW7IKL5HD377WPRWX3SI6`
**Reproducible con:** `npm run medir` desde `frontend/`

Esta medición existe porque veníamos afirmando que Stellar hacía barato el
micropago **sin haberlo comprobado**. Ya está comprobado, y el resultado
contradice lo que decíamos.

---

## Lo que la red cobró de verdad

De las transacciones ejecutadas por la cuenta del dueño, leídas de Horizon.
No son estimaciones: es `fee_charged`.

| Operación | Stroops cobrados | XLM |
|---|---:|---:|
| `pay` — un pago del agente | 791.591 | 0,0791591 |
| `create_fuse` — crear un fusible | ~6.600.000 | ~0,66 |
| `fund` — depositar | 8.658 | 0,0008658 |
| `revoke` — cortar | 3.758 | 0,0003758 |
| Desplegar el contrato (una vez) | 148.923.854 | 14,89 |

Las lecturas (`estado`, `de_dueno`) **no cuestan nada**: se resuelven
simulando, sin enviar transacción.

## El número que importa

**Un pago del agente cuesta 0,0792 XLM.**

Es la operación que se repite. Todo lo demás ocurre una vez por fusible.

---

## Comparación con AWS AgentCore

| | Fusible | AgentCore + Coinbase CDP |
|---|---|---|
| Costo por pago | 0,0792 XLM | USD 0,005 por operación de wallet |
| Nivel gratuito | Ninguno | **5.000 operaciones al mes** |

Con XLM a **USD 0,178** ([OKX](https://www.okx.com/en-us/price/stellar-xlm) y
[Bybit](https://www.bybit.com/en/price/stellar/), 19 de octubre de 2026):

> **Un pago en Fusible cuesta unos USD 0,0141. En AgentCore cuesta USD 0,005,
> y los primeros 5.000 del mes son gratis.**

**Fusible es entre 2,8 veces más caro y, por debajo de 5.000 operaciones
mensuales, infinitamente más caro, porque el competidor no cobra nada.**

### El precio de indiferencia

Para que un pago en Fusible costara lo mismo que uno en AgentCore, XLM
tendría que valer **USD 0,063**. Hoy está en 0,178, casi tres veces por
encima. El precio tendría que caer a un tercio para empatar — y aun así
seguirían ganando por el nivel gratuito.

---

## Qué significa

**El argumento de costo frente a AgentCore no existe. Es al revés.**

Lo que queda en pie de la diferenciación es lo otro: que el límite y el
registro no los administra ninguna de las partes. Ese sigue siendo
arquitectónico y no se cierra bajando un precio. Pero hay que dejar de decir
que esto es más barato, porque no lo es.

## Por qué cuesta tanto, y qué se puede hacer

El `pay` actual **reescribe el fusible entero en cada pago** — incluida la
lista de destinos permitidos, que nunca cambia. El resource fee cobra por
bytes escritos, así que estamos pagando por reescribir datos inmutables en
cada transacción.

**La optimización evidente:** separar lo que nunca cambia (dueño, agente,
token, topes, destinos, vigencia) de lo único que sí cambia (`gastado` y
`cortado`). Así `pay` escribiría un entero en vez de una estructura completa.

**Cuánto bajaría: no lo sé.** No está medido y no voy a estimarlo. Hay que
implementarlo y volver a correr `npm run medir`.

Incluso en el mejor caso hay un piso que no se puede bajar: leer el estado,
ejecutar el contrato y transferir el token tienen un costo propio. Es
plausible que después de optimizar siga siendo más caro que AgentCore.

## Matices que no medí

- Parte del resource fee corresponde a **renta de almacenamiento**, y la
  documentación de Stellar la describe como reembolsable. No comprobé cuánto
  vuelve, así que los números de arriba son el cobro bruto.
- Son fees de **testnet**. El mínimo de red es el mismo en mainnet, pero la
  congestión puede subir la parte de inclusión.
- El despliegue de 148.923.854 stroops es subir el `.wasm`, y ocurre una
  sola vez por versión del contrato.
