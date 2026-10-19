# Hoja de ruta

**Última actualización:** 19 de octubre de 2026
**Demo Package:** domingo 25 de octubre · **Demo Day:** lunes 26 de octubre

> Las estimaciones de esfuerzo de este documento **no están medidas**. Son
> juicio, no datos, y el peor caso puede ser bastante peor. Lo único medido
> es lo que ya está hecho y verificable en el explorador.

---

## Dónde estamos

| Pieza | Estado |
|---|---|
| Contrato multi-fusible en Soroban | Desplegado en testnet y funcionando |
| Crear, fondear, pagar, cortar y retirar | Verificado contra la red desde el front |
| Las cinco reglas rechazando de verdad | Verificado |
| Interfaz desplegada en Vercel | Sí |
| Pruebas del contrato | Escritas; se ejecutan en CI, no en Windows |
| Usuarios entrevistados | **Cero** |

---

## Una aclaración antes del plan: no hace falta un sistema de cuentas

La idea de "que las personas creen su cuenta" ya está resuelta por la
billetera. En Stellar **la billetera es la cuenta**: la dirección identifica
al usuario y la firma demuestra que es él. No hay registro, ni contraseñas,
ni base de datos de usuarios, ni recuperación de contraseña que mantener.

Eso elimina semanas de trabajo y un problema de seguridad entero. El paso
"vincular la billetera" no es un paso extra del registro: **es el registro**.

Lo único que sigue haciendo falta es que el contrato sepa qué fusibles son de
quién, para poder listarlos.

---

## Antes del Demo Package · 19 → 25 de octubre

Seis días, con dedicación parcial. Ordenado por lo que más cambia la
demostración.

### 1. Que el dueño firme con su propia billetera · **hecho el 19 de octubre**

> La capa de firma quedó abstraída: el mismo código funciona con Freighter o
> con la llave de demostración. **La firma real con Freighter no se ha
> probado todavía** — el navegador de desarrollo no tiene la extensión
> instalada. Lo verificado es la detección de su ausencia, que la interfaz
> ofrezca instalarla, y que las operaciones siguen funcionando con la llave
> local. Falta una prueba en un navegador con Freighter en Test Net.

#### Lo que decía el plan

**Qué:** reemplazar la llave embebida del dueño por Freighter. El usuario
conecta su billetera, crea su fusible y lo firma él.

**Por qué primero:** es el salto de "una demostración" a "un producto que
alguien puede usar". Hoy cualquiera que abra el sitio opera *mi* fusible con
*mi* llave; después, cada quien tendrá el suyo.

**Riesgo:** quien no tenga Freighter instalado no puede probar nada. **Se
mitiga manteniendo el modo demostración con llave embebida**, que además es
lo que vas a usar al grabar el video.

*Esfuerzo estimado, no medido: medio. Peor caso, un día completo.*

### 2. Que cada quien vea sus propios fusibles · **hecho el 19 de octubre**

> El contrato guarda ahora un índice por dueño (`de_dueno`) y el front lista
> los fusibles de quien está firmando, con un selector para moverse entre
> ellos. Verificado contra la red: dos fusibles creados, cada uno con sus
> propias reglas, y el selector alterna bien entre ambos.
>
> **Contrato nuevo:** `CD2ZSG35QKJGNN4EERA55DW62JEWFB567TJYW7IKL5HD377WPRWX3SI6`
> — el anterior sigue desplegado y el entregable 4 apunta a él.

#### Lo que decía el plan

**Qué:** el contrato guarda un índice de fusibles por dueño y el front lista
los del usuario conectado.

**Por qué:** sin esto, conectar tu billetera no sirve de nada — no habría
forma de volver a encontrar el fusible que creaste.

**Implica cambiar el contrato y volver a desplegar.** El actual queda vivo.

*Esfuerzo estimado, no medido: medio.*

### 3. Medir el costo real por invocación · **hecho el 19 de octubre**

> **El resultado nos desfavorece.** Un pago cuesta 0,0792 XLM (~USD 0,0141)
> contra USD 0,005 de AgentCore, que además regala 5.000 operaciones al mes.
> El argumento de costo no existe; ver [`costos.md`](costos.md).
>
> Siguiente paso derivado: `pay` reescribe el fusible completo en cada pago,
> incluida la lista de destinos que nunca cambia. Separar lo inmutable de lo
> mutable debería bajarlo — cuánto, no está medido.

#### Lo que decía el plan

**Qué:** simular cada operación con `simulateTransaction` y anotar el fee
—inclusion y resource— en la documentación.

**Por qué:** es el pendiente que arrastramos desde la revisión de
competencia. Decide si el argumento de costo frente a AWS AgentCore existe o
no. Hoy afirmamos que Stellar es más barato **sin haberlo medido**, y eso no
se puede sostener en el Demo Day si alguien pregunta.

*Esfuerzo estimado, no medido: pequeño. Es la mejor relación valor/trabajo
de la lista.*

### Lo que NO haría antes del 25

**Un agente de IA real consumiendo un servicio de pago.** Es lo más vistoso
y lo entiendo, pero en seis días con el video, la documentación y el Demo Day
encima, el riesgo de llegar con algo a medias es alto. Va en los 30 días, y
abajo está el diseño.

**Pasar a mainnet.** No hay razón: el programa es en testnet y mainnet
implica dinero real sin auditoría.

---

## Hoja de ruta de 30 días · después del cierre

### Semana 1 — Hablar con usuarios

Es la deuda más vieja del proyecto y bloquea todo lo demás. Cinco
conversaciones con responsables de presupuesto técnico, con las cuatro
hipótesis y sus criterios ya escritos en
[`semana4/MVPFunctional.md`](semana4/MVPFunctional.md).

Si **H4** cae —que nadie acepte mover presupuesto a un activo digital— el
resto de esta hoja de ruta cambia de raíz. Por eso va primero.

### Semana 2 — El agente que paga de verdad

Aquí es donde el producto deja de ser una demostración.

**Cómo encaja, según la documentación oficial de Stellar.** La skill de
pagos agénticos describe tres caminos y para este caso recomienda el de
menor fricción:

| Camino | Transacción por petición | Necesita facilitador | El cliente necesita XLM |
|---|---|---|---|
| **x402** | Sí | Sí, propio o alojado | No, las comisiones van patrocinadas |
| **MPP Charge** | Sí | No | Opcional |
| **MPP Session** | No, compromisos fuera de cadena | No | Sí |

**El diseño que propongo:** un servicio propio que cobra por petición y un
agente que lo consume pagando **a través del fusible**. Fusible no compite
con x402 — se pone encima: x402 resuelve *cómo se cobra*, Fusible resuelve
*hasta cuánto puede gastar quien paga*.

Esa es exactamente la pieza que la documentación de x402 deja a la
aplicación: el protocolo no define control de presupuesto.

**Sobre el costo:** si el agente usa un modelo de lenguaje real, eso cuesta
dinero de verdad. **No sé cuánto**, depende del modelo y del volumen. Antes
de ejecutar nada que cobre, hay que fijar el gasto máximo aceptable. Para la
demostración se puede empezar con un servicio que no invoque ningún modelo —
el punto que se demuestra es el pago acotado, no la inteligencia del agente.

### Semana 3 — Cambiar a USDC

Hoy los fusibles mueven XLM nativo. Lo natural es USDC, que es lo que usan
los protocolos de pago agénticos por defecto.

El contrato ya acepta cualquier token: recibe la dirección del activo como
parámetro. El cambio es de configuración y de interfaz, más la trustline que
necesita cada cuenta.

> En testnet el SAC de USDC es
> `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`.
> Ojo con no confundir el emisor clásico (`G…`) con el contrato (`C…`): son
> dos direcciones distintas y se usan en sitios distintos.

### Semana 4 — Cerrar el argumento

- Aviso antes de llegar al tope, en vez de solo cortar
- Migrar los eventos a `#[contractevent]`
- Auditoría del contrato si el proyecto sigue adelante

---

## Lo que decide si esto sigue

Tres preguntas abiertas, en orden de cuánto pesan:

1. **¿Alguien paga por esto?** Sin las entrevistas no hay respuesta, y todo
   lo demás es construir a ciegas.
2. **¿El costo nos favorece?** Si una invocación al contrato resulta más cara
   que los USD 0,005 de Coinbase —y recuerda que las primeras 5.000
   operaciones mensuales allí son gratis—, el argumento de costo desaparece y
   solo queda el del registro independiente.
3. **¿El nicho multi-parte existe?** Es la única diferencia que AWS no puede
   cerrar cambiando una configuración, y hoy es una hipótesis mía, no un
   hallazgo.

Las tres se responden hablando con gente, no escribiendo código.
