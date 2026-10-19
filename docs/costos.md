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

## El intento de optimización que falló

**Hipótesis:** `pay` reescribía el fusible entero, incluida la lista de
destinos; separar lo inmutable de lo mutable debería abaratarlo.

**Se implementó y se midió. No sirvió.**

| | Antes | Después |
|---|---:|---:|
| `pay` | 932.854 | 931.229 |
| `create_fuse` | 7.094.935 | 8.383.428 |

0,17% de mejora en el pago, y un 18% **más caro** al crear, porque ahora se
escriben dos entradas en vez de una. El experimento se revirtió.

**Por qué la hipótesis era falsa.** El desglose de recursos de la simulación
lo deja claro:

| Operación | Fee | Instrucciones | Bytes escritos | Entradas RW |
|---|---:|---:|---:|---:|
| `pay` | 931.129 | 1.512.556 | 644 | 4 |
| `fund` | 13.490 | 978.880 | 568 | 3 |
| `revoke` | 8.517 | 757.150 | 200 | 1 |

`pay` escribe 644 bytes y `fund` 568 — prácticamente lo mismo — pero `pay`
cuesta **69 veces más**. El costo no está en los bytes que escribimos
nosotros.

**Qué no sé.** No identifiqué qué lo encarece. La pista es que `pay` toca una
entrada de lectura-escritura más que `fund`, y la diferencia entre ambas es
el sentido de la transferencia: `fund` mueve del dueño al contrato, `pay`
mueve del contrato a una cuenta externa. Sospecho que el costo está en esa
transferencia saliente del SAC, no en nuestro contrato, pero **es una
sospecha sin comprobar**.

Comprobarlo requiere aislar la transferencia: medir un `pay` que valide las
reglas pero no transfiera, y comparar. Queda pendiente.

## Qué se puede hacer todavía

Descartada la hipótesis de los bytes escritos, quedan dos vías, ninguna
medida:

1. **Aislar el costo de la transferencia.** Si viene del SAC y no de nuestro
   contrato, no hay nada que optimizar de nuestro lado: es el precio de
   mover un activo en Stellar, y afecta por igual a cualquier producto que
   mueva dinero en esta red.
2. **Acumular pagos.** Si el costo está en la transferencia, hacer una por
   cada petición del agente es lo más caro posible. Un modelo de canal
   —acumular muchas peticiones y liquidar una vez— lo esquiva. Es
   exactamente lo que hace **MPP Session**, el tercer camino de la
   documentación de pagos agénticos de Stellar, que descartamos por
   complejidad al diseñar.

La segunda es la que puede cambiar el resultado de verdad, y cambia la
arquitectura, no un detalle.

## Matices que no medí

- Parte del resource fee corresponde a **renta de almacenamiento**, y la
  documentación de Stellar la describe como reembolsable. No comprobé cuánto
  vuelve, así que los números de arriba son el cobro bruto.
- Son fees de **testnet**. El mínimo de red es el mismo en mainnet, pero la
  congestión puede subir la parte de inclusión.
- El despliegue de 148.923.854 stroops es subir el `.wasm`, y ocurre una
  sola vez por versión del contrato.
