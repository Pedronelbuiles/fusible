# Cuánto cuesta operar un fusible

**Medición:** 23 de octubre de 2026 · Stellar testnet
**Contrato:** `CD5ES3IRDQUVSFS5IYAFHK7FWGGE3DUBN4HKCTE7PR5KNMLPQKM77ZC7`
**Reproducible con:** `npm run medir` desde `frontend/`

> **Esta versión corrige un error grave de la medición del 19 de octubre**,
> que daba el pago por 94 veces más caro de lo que es y nos llevó a concluir
> que perdíamos el argumento de costo. No lo perdemos. Al final está qué
> estaba mal y por qué.

---

## Lo que la red cobra de verdad

`fee_charged` leído de Horizon sobre las operaciones ya ejecutadas. No son
estimaciones, y se agrupan por función del contrato.

| Función | La firma | Veces medida | Stroops | XLM |
|---|---|---:|---:|---:|
| `revoke` — cortar | dueño | 1 | 3.758 | 0,0003758 |
| `sweep` — retirar | dueño | 1 | 8.220 | 0,0008220 |
| **`pay` — un pago del agente** | **agente** | **24** | **8.406** | **0,0008406** |
| `fund` — depositar | dueño | 11 | 8.651 | 0,0008651 |
| `create_fuse` — crear | dueño | 12 | 6.491.353 | 0,6491353 |
| Desplegar el contrato (una vez) | dueño | — | 148.923.854 | 14,89 |

Las lecturas (`estado`, `de_dueno`) **no cuestan nada**: se resuelven
simulando, sin enviar transacción.

## El número que importa

**Un pago del agente cuesta 0,00084 XLM.** Es la operación que se repite;
todo lo demás ocurre una vez por fusible.

Medido 24 veces, en dos días distintos, con un rango de 8.406 a 8.696
stroops. Es estable.

**Crear un fusible cuesta 0,65 XLM**, y eso sí es caro: 772 pagos. Es el
precio de abrir entradas nuevas de almacenamiento persistente y pagar su
renta por adelantado. Se amortiza con el uso, pero encarece al usuario que
crea muchos fusibles pequeños.

---

## Comparación con AWS AgentCore

| | Fusible | AgentCore + Coinbase CDP |
|---|---|---|
| Por pago | 0,00084 XLM | USD 0,005 por operación de wallet |
| Crear el presupuesto | 0,65 XLM, una vez | Sin costo aparte |
| Nivel gratuito | Ninguno | 5.000 operaciones al mes |

El precio del XLM al 23 de octubre de 2026 **no lo pude fijar**: las fuentes
consultadas van de USD 0,09 a USD 0,22 y ninguna trae fecha fiable. Así que
el rango completo:

| XLM a… | Un pago cuesta | Frente a los USD 0,005 de AgentCore |
|---|---|---|
| USD 0,09 | USD 0,000076 | 66 veces más barato |
| USD 0,18 | USD 0,000151 | 33 veces más barato |
| USD 0,22 | USD 0,000185 | 27 veces más barato |

**La conclusión no depende del precio: en todo el rango somos entre 27 y 66
veces más baratos por pago.** Haría falta que el XLM se multiplicara por 27
para empatar.

### Dónde está el cruce de verdad

El nivel gratuito de AgentCore es real y hay que contarlo. Con XLM a USD
0,18, y sumando el costo de crear el fusible:

| Pagos al mes | Fusible | AgentCore | Gana |
|---:|---:|---:|---|
| 1.000 | USD 0,27 | USD 0 | AgentCore |
| 5.000 | USD 0,87 | USD 0 | AgentCore |
| 10.000 | USD 1,63 | USD 25 | **Fusible, 15×** |
| 100.000 | USD 15,2 | USD 475 | **Fusible, 31×** |

**Por debajo de unos 5.200 pagos mensuales, AgentCore sale gratis y nosotros
no. Por encima, la diferencia se abre rápido.**

---

## Qué significa

El argumento de costo **existe y nos favorece**, a partir de cierto volumen.
Pero sigue sin ser el argumento principal, por dos razones:

1. Por debajo de 5.000 operaciones al mes el competidor es gratis, y ahí
   vive el usuario que está probando.
2. Un precio se baja. Que el límite y el registro no los administre ninguna
   de las partes es arquitectónico, y eso no se iguala cambiando una tarifa.

**El orden correcto es: primero el control independiente, y el costo como
refuerzo cuando el volumen crece.**

---

## Qué estaba mal en la medición del 19 de octubre

Dos errores que se reforzaron entre sí.

### 1. Se midió la cuenta equivocada

El script leía las transacciones del **dueño**. Pero `pay` **lo firma el
agente**, con su propia cuenta. En esa tabla no había ni un solo pago, y se
tomó el cobro de otra operación —una de las caras, del orden de 0,079 XLM—
como si fuera el del pago.

Ya está corregido: el script lee las dos cuentas y **decodifica qué función
fue cada cobro**, así que la tabla ya no se puede leer mal.

### 2. Se comparó la simulación con el cobro real

Las cifras de 931.129 y 1.803.611 stroops que manejábamos para `pay` salen
de `simulateTransaction`. **La simulación reserva presupuesto para extender
el TTL de los datos; la red solo lo cobra cuando toca extenderlo de verdad.**
Como el TTL se extiende a 90 días y se renueva mucho antes de agotarse, casi
nunca toca. De ahí el factor de ~215 entre lo estimado y lo cobrado.

### Lo que esto disuelve

**La paradoja del "69×" no existía.** Decíamos que `pay` costaba 69 veces
más que `fund` escribiendo los mismos bytes, y sospechábamos de la
transferencia saliente del SAC. En cobro real:

| | Simulación | Cobro real |
|---|---:|---:|
| `pay` | 1.803.611 | 8.406 |
| `fund` | 13.498 | 8.651 |

**Cuestan prácticamente lo mismo, y `pay` es incluso algo más barato.** No
hay nada que investigar en la transferencia del SAC: la diferencia era un
artefacto de comparar una estimación con un cobro.

**La "optimización que falló" también se explica.** Separar las reglas del
saldo no mejoró nada porque estaba optimizando contra un número que no era
el costo. Haber revertido aquel cambio fue lo correcto, pero por una razón
distinta de la que anotamos.

### Lo que el nombre del fusible añadió

Se midió aparte, comparando el contrato con nombre contra el anterior sin
nombre, el mismo día y con los mismos parámetros:

| | Sin nombre | Con nombre | Diferencia |
|---|---:|---:|---:|
| `pay` (simulado) | 1.803.686 | 1.803.711 | **+25 stroops** |

Despreciable: 0,0000025 XLM.

---

## Matices que siguen sin medir

- Parte del fee es **renta de almacenamiento**, que la documentación de
  Stellar describe como reembolsable. No comprobé cuánto vuelve.
- Son fees de **testnet**. El mínimo de red es el mismo en mainnet, pero la
  congestión puede subir la parte de inclusión.
- `create_fuse` muestra una dispersión grande entre ejecuciones (de 6,5
  millones a 2.144 millones de stroops). **No investigué a qué se debe**;
  la sospecha es que el máximo corresponde a una ejecución que sí tuvo que
  pagar extensión de TTL, pero no está comprobado.
- El precio del XLM en USD no está fijado para hoy; arriba va el rango.
