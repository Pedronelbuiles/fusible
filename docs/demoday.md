# Demo Day · lunes 26 de octubre de 2026

Fusible entró al top 10 en el puesto **#6**. Se presenta en vivo.

Este documento es para usar el lunes, no para entregar. Tiene tres partes:
el guion en bloques, el protocolo de la demo en vivo y las preguntas duras
con su respuesta.

---

## 1. El guion, en bloques de un minuto

La duración del pitch no está confirmada, así que el guion está en bloques
sueltos. **B2 no se recorta nunca**: es la demo, y es lo único que los otros
nueve no pueden contar igual.

| Si tienes… | Usa |
|---|---|
| 3 minutos | B0 · B1 · **B2** · B6 |
| 5 minutos | B0 · B1 · **B2** · B3 · B5 · B6 |
| 7 o más | todos, y B4 completo |

---

### B0 · El gancho — 30 s

> Un agente de inteligencia artificial llamado JertLinc3522 levantó cinco
> instancias en AWS por su cuenta. En cerca de un día acumuló una factura de
> **seis mil quinientos treinta y un dólares**.
>
> Su operador no se dio cuenta. Lo descubrió la comunidad del proyecto, que
> vio la infraestructura levantada. Terminó pidiendo donaciones para pagarla,
> diciendo que el error lo había cometido la IA.
>
> No hubo ataque. El programa simplemente hizo lo que sabía hacer, sin que
> nada le dijera "hasta aquí".

*No digas "imaginen". Es un caso real y con cifra. Deja un segundo de
silencio después de los 6.531.*

### B1 · El problema — 45 s

> Hoy, para que un programa autónomo pague, hay que darle una credencial con
> un medio de pago detrás. Esa credencial no tiene tope.
>
> El límite, cuando existe, lo guarda la misma plataforma que cobra. Y el
> registro de lo que gastó lo guarda esa misma plataforma. Si hay una
> disputa, las dos partes miran el papel de una sola de ellas.
>
> El daño se descubre cuando llega la factura. Es tarde por definición.

### B2 · La demo — 90 s · **no se recorta**

Secuencia exacta en la sección 2. Lo que dices mientras tanto:

> Esto es Fusible. Es un contrato en Stellar y lo que ven está leído de la
> red, no de la página.
>
> Este fusible tiene **diez XLM** de presupuesto y un tope de **dos** por
> operación. Lo definí yo al crearlo, y una vez creado **no lo puede cambiar
> nadie. Tampoco yo.**
>
> *(clic en "Ponerlo a trabajar")*
>
> Este agente tiene una tarea de ocho pasos y paga por cada uno. **No
> comprueba su saldo. No sabe cuándo parar.** Pide hasta que algo se lo
> impida.
>
> *(dejar que corra; la barra sube)*
>
> Ahí está. **Se detuvo.** Y no lo detuve yo, ni un servidor mío: lo detuvo
> el contrato, porque la operación siguiente se pasaba del tope.
>
> Cada uno de esos pagos dejó un hash que cualquiera puede verificar en el
> explorador, sin pedirnos permiso a nosotros.

*La frase que tiene que quedar es: **el que dice "no" no es ninguna de las
dos partes**.*

### B3 · Por qué en cadena — 45 s

> La pregunta legítima es por qué esto no es una base de datos con un
> `if saldo > tope`.
>
> Porque en ese caso el límite lo guarda alguien, y ese alguien puede
> cambiarlo. Si quien provee el servicio es quien custodia el tope, el
> cliente tiene que confiar en él. Y si el tope lo guarda el cliente, el
> proveedor tiene que confiar en el cliente.
>
> Aquí el tope está en un contrato que **ninguno de los dos administra**, y
> el registro de gasto es el mismo para ambos. Esa es la única razón por la
> que esto está en una cadena, y es suficiente.

### B4 · Qué ya existe — 45 s · el bloque honesto

> Esto no es un espacio vacío. **AWS lanzó AgentCore Payments en agosto**, y
> tiene límites de gasto y auditoría. Privy y Openfort ofrecen topes y
> listas de destinos. OpenZeppelin está construyendo algo parecido sobre
> Stellar.
>
> Lo revisamos tarde y nos obligó a corregir tres entregables. Está
> documentado en el repositorio.
>
> Lo que sigue en pie es esto: en todos esos casos el límite vive dentro de
> la plataforma de una de las partes. Cuando quien paga y quien cobra son
> empresas distintas, eso no alcanza — y es ahí donde Fusible tiene algo que
> los demás no cierran cambiando una configuración.

*Decirlo tú antes de que lo pregunte el jurado te da credibilidad. Esconderlo
y que te lo pregunten te la quita.*

### B5 · Lo que cuesta — 30 s

> Un pago a través del fusible cuesta **0,00084 XLM**. Medido veinticuatro
> veces sobre la red, no estimado.
>
> Frente a los cinco milésimos de dólar por operación que cobra la
> alternativa de AWS, somos entre **veintisiete y sesenta y seis veces más
> baratos**, según el precio del XLM.
>
> Con una salvedad honesta: AWS regala las primeras cinco mil operaciones al
> mes. Por debajo de ese volumen ellos son gratis y nosotros no. Por encima,
> la diferencia se abre rápido.

### B6 · Qué sigue — 30 s

> Lo que falta no es código. **Todavía no he hecho las entrevistas con
> usuarios**, y esa es la deuda más vieja del proyecto. Es lo primero de la
> hoja de ruta de treinta días.
>
> Después: cambiar a USDC, que es lo que usan los protocolos de pago entre
> agentes, y un agente real consumiendo un servicio real.
>
> Lo que busco de ustedes es contacto con alguien que hoy tenga un agente en
> producción gastando dinero. Esa conversación vale más que cualquier cosa
> que pueda programar esta semana.

*Un ask concreto se recuerda. "Gracias por su atención" no.*

---

## 2. Protocolo de la demo en vivo

La demo va en vivo y sin video de respaldo. Entonces el trabajo es **quitarle
pasos lentos**, no tener un plan B.

### Lo que NO se hace en el escenario

**No crear el fusible en vivo.** `create_fuse` es la operación lenta y cara
—0,65 XLM y varios segundos—, y es la que más puede hacerte esperar frente a
la sala. Llega con los fusibles ya creados y fondeados.

### Antes de salir de casa

1. `cd frontend && npm run dev`, entrar en modo demostración, **crear dos
   fusibles**:
   - uno llamado algo como **"Agente de investigación"**, 10 XLM de tope y
     2 por operación — este es el que vas a reventar en vivo
   - otro de respaldo, idénticos parámetros, por si el primero queda en un
     estado raro
2. Comprobar que los dos aparecen en el selector por su nombre.
3. Dejar la pestaña **ya abierta en el fusible bueno**, con el registro
   cargado. No empieces desde la landing.
4. Zoom del navegador al **110–125 %** y ventana en pantalla completa (F11).
   Lo que en tu monitor se lee, en un proyector al fondo de la sala no.
5. Silenciar notificaciones del sistema.

### Si la testnet se reinició el fin de semana

Se nota porque las lecturas fallan o el selector sale vacío. Entonces:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\redesplegar.ps1
```

Y actualizar `VITE_CONTRACT_ID` en Vercel **y redesplegar** si vas a usar el
sitio publicado. Deja hecho esto el domingo, no el lunes.

### En el escenario, la secuencia exacta

| # | Acción | Qué dices |
|---|---|---|
| 1 | Pantalla ya en el fusible | "Diez XLM, tope de dos por operación. Está en el contrato." |
| 2 | Señalar "Leído del contrato en la red de pruebas" | "Esto no es una maqueta." |
| 3 | Clic en **Ponerlo a trabajar** | "Ocho pasos. No comprueba su saldo." |
| 4 | Callar y dejar que corra | *(deja que la sala mire la barra)* |
| 5 | El contrato lo detiene | "Se detuvo. Y no lo detuve yo." |
| 6 | Clic en **ver en el explorador** de un pago | "Esto lo puede verificar cualquiera." |

El paso 6 es el que convierte "una aplicación bonita" en "esto es real".
Ten `stellar.expert` ya cargado en otra pestaña por si tarda.

### Si algo falla en vivo

No disimules. Di lo que pasó y sigue:

> "La testnet está tardando. Mientras responde: lo que iban a ver es el
> contrato rechazando el séptimo pago…"

Y sigue con B3. El jurado perdona una red lenta; no perdona a alguien
fingiendo que no pasó nada.

---

## 3. Las preguntas duras

### "¿Esto no lo hace ya AWS con AgentCore?"

> **Sí, en parte.** AgentCore tiene límites de gasto y auditoría desde
> agosto. La diferencia es dónde vive el límite: en AgentCore vive dentro de
> la plataforma de una de las partes. Cuando quien paga y quien cobra son
> empresas distintas, un registro que administra una de las dos no sirve
> como evidencia ante la otra.

### "¿Hablaste con usuarios?"

> **No. Cero entrevistas, y es la falla más grande del proyecto.** Tengo las
> cuatro hipótesis escritas con sus criterios de refutación, y son lo primero
> de los treinta días. Si la cuarta cae —que nadie acepte mover presupuesto a
> un activo digital— la hoja de ruta cambia de raíz.

*No la adornes. Un jurado detecta el adorno y entonces duda de todo lo demás.*

### "¿Por qué no una base de datos?"

Es B3. Dilo igual.

### "¿Está auditado? ¿Está en mainnet?"

> **No y no.** Está en testnet, sin auditoría, y por eso no mueve dinero
> real. La auditoría está en la hoja de ruta condicionada a que las
> entrevistas confirmen que alguien lo quiere.

### "¿Qué pasa si el agente que falla es el tuyo?"

> El fusible no confía en el agente. El agente **no puede** leer ni cambiar
> su propio límite: solo puede pedir un pago, y el contrato lo aprueba o lo
> rechaza. Un agente comprometido no puede subirse el tope, y la pérdida
> máxima es lo que haya en el fusible.

### "¿Cuánto cuesta?"

Es B5. Y si piden la fuente: `docs/costos.md`, con `fee_charged` real de
Horizon, reproducible con `npm run medir`.

### "¿Cuánto te tomó? / ¿Lo hiciste solo?"

> Cinco semanas, y sí, solo. El programa pide equipos de cuatro a cinco;
> pedí permiso para ir solo y me lo dieron.

*Dilo sin dramatizar. El dato habla por sí mismo estando en el puesto 6.*

---

## 4. Lo que NO hay que hacer este fin de semana

- **No agregar funciones nuevas.** Cada cambio es una forma nueva de que la
  demo falle el lunes. El producto ya cuenta la historia.
- **No pasar a mainnet.** Dinero real, sin auditoría, en tres días.
- **No tocar el contrato.** Está desplegado, probado y funcionando.

Lo único que queda por hacer es **ensayar la demo hasta que salga sin
pensarla**, y cronometrarla.
