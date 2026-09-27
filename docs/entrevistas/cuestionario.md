# Cuestionario de validación — Fusible

**Objetivo:** confirmar o refutar los supuestos del Problem Brief con
evidencia real, no con opiniones. Tres entrevistas antes del sábado.

---

## A quién entrevistar

Prioriza en este orden. No necesitas los tres del mismo tipo.

| Perfil | Por qué sirve | Dónde encontrarlo |
|---|---|---|
| **1. Quien responde por el gasto** — líder técnico, CTO, alguien de plataforma | Es el usuario del brief. El dolor es suyo y decide | Tu red directa. El más fácil de conseguir |
| **2. Quien construye agentes** — dev con algo autónomo en producción | Vive el límite técnico todos los días | Comunidades de dev de Medellín, Discord del bootcamp |
| **3. Quien responde por el incidente** — seguridad, SRE, alguien que haya vivido un consumo disparado | Valida el ángulo de contención de daño, que es el diferenciador | Tu red. Vale doble si ya le pasó algo |

**Ojo con el sesgo:** si los tres son de tu mismo entorno vas a confirmar lo
que ya crees. Al menos uno debería ser de otra empresa.

---

## Las tres reglas

1. **Pregunta por el pasado, no por el futuro.** "¿Qué hiciste la última vez
   que…?" y no "¿usarías esto?". Nadie sabe qué va a hacer; todos saben qué
   hicieron.
2. **No menciones tu solución hasta el bloque 5.** Si la sueltas antes, la
   persona pasa a ser amable contigo y la entrevista se arruina.
3. **Busca que te refuten.** Una entrevista donde todo te dio la razón
   probablemente fue una entrevista mal hecha. Anota las contradicciones:
   valen más que los elogios.

---

## Guion — 20 minutos

### Apertura (1 min)

> Estoy en un bootcamp de blockchain y esta semana tengo que entender un
> problema antes de proponer nada. No te vengo a vender ni a mostrar nada.
> Quiero que me cuentes cómo hacen ustedes esto hoy. ¿Te puedo grabar solo
> para no tomar notas? Si prefieres que no, no hay problema.

### Bloque 1 — El estado actual (4 min)

- ¿Tienen hoy algo de IA que ejecute acciones sin que alguien apruebe cada
  paso? ¿Qué hace exactamente?
- ¿Ese proceso consume servicios que se pagan por uso? ¿Cuáles?
- ¿Cómo está montado el pago hoy? ¿Tarjeta, prepago, factura mensual?
- ¿Quién es el dueño de esa tarjeta o de esa cuenta?

### Bloque 2 — Los límites que ya intentaron (5 min) · *el bloque más importante*

- ¿Le pusieron algún límite a ese consumo? ¿Cómo lo hicieron?
- ¿Con qué se toparon al intentarlo?
- La última vez que el consumo se salió de lo esperado, ¿qué pasó?
  - ¿Cuánto tiempo pasó antes de que alguien se diera cuenta?
  - ¿Cómo se enteraron? ¿Alerta, factura, alguien revisando?
  - ¿Cuánto fue? *(si no quieren dar la cifra, pide el orden de magnitud)*
  - ¿Qué hicieron para cortarlo? ¿Cuánto se demoraron?
- ¿Ha habido alguna vez que prefirieron **no** automatizar algo justamente
  por no poder acotar el gasto? Cuéntame ese caso.

> **Esta última pregunta es oro.** Si la respuesta es sí, tu hipótesis está
> viva: el problema no es que gasten de más, es que dejan valor sobre la
> mesa por miedo.

### Bloque 3 — Visibilidad y registro (3 min)

- ¿Cómo saben hoy cuánto gastó cada proceso o cada cliente?
- ¿Cuánto tiempo al mes se les va conciliando eso?
- ¿Alguna vez les ha tocado disputarle un cobro a un proveedor? ¿Con qué
  evidencia lo hicieron?
- Si mañana tuvieran que explicarle a alguien de afuera —un auditor, un
  cliente— qué gastó exactamente ese proceso, ¿con qué lo probarían?

### Bloque 4 — El ángulo de seguridad (3 min)

- ¿Han pensado en qué pasaría si alguien logra manipular a ese proceso para
  que haga algo que no debía?
- Si eso pasara y el proceso tuviera capacidad de pagar, ¿qué tan grande
  podría ser el daño antes de que alguien lo detenga?
- ¿Existe hoy un botón para cortarlo en caliente? ¿Quién lo puede apretar?
  ¿Cuánto se demora?

### Bloque 5 — Recién aquí, la idea (3 min)

> Te cuento en lo que estoy trabajando: un presupuesto que vive fuera de tu
> sistema y del sistema del proveedor, con un tope que ni el proceso ni yo
> podemos cambiar después, una lista cerrada de a quién se le puede pagar, y
> un interruptor de corte. Todo lo que gasta queda en un registro que
> ninguna de las dos partes controla.

- ¿Qué es lo primero que no te cuadra de eso?
- ¿Qué tendría que ser cierto para que lo probaras con algo real?
- ¿Qué te haría descartarlo de entrada?

> **No preguntes "¿lo usarías?".** Pregunta qué tendría que ser cierto. La
> respuesta te da los supuestos que faltan.

### Cierre (1 min)

- Si esto existiera y funcionara, ¿quién en tu empresa tendría que aprobarlo?
- ¿Conoces a alguien más a quien debería preguntarle esto?
- ¿Te puedo escribir en dos semanas para mostrarte lo que construí?

---

## Qué anotar (plantilla)

Copia esto una vez por entrevista y guárdalo en `docs/entrevistas/`.

```markdown
## Entrevista [N] — [rol, no nombre si prefiere anonimato]
Fecha: · Duración: · Empresa/sector:

### Cómo pagan hoy
### Límites que intentaron y con qué se toparon
### El incidente (qué pasó, cuánto tardaron en verlo, magnitud)
### Lo que NO automatizaron por miedo al gasto
### Cómo concilian y cuánto les cuesta
### Reacción a la idea — la primera objeción
### Qué tendría que ser cierto para que lo probaran

### Cifras textuales
- (frases en primera persona, entre comillas)

### Veredicto por supuesto
| Supuesto | Confirma | Refuta | Sin evidencia |
|---|---|---|---|
| 1. Disposición a presupuesto en stablecoin | | | |
| 2. Proveedores cobrando por request | | | |
| 3. Tope duro mejor que alerta | | | |
| 4. El riesgo de manipulación se percibe real | | | |

### Lo que me sorprendió
### Qué cambio en el proyecto por esto
```

---

## Cómo convertir esto en puntos

1. Las **frases textuales** son la evidencia. Una cita de un líder técnico
   diciendo *"nos comimos un consumo de X y nos enteramos a los N días"*
   vale más que cualquier estimación tuya.
2. Reemplaza cada `[PENDIENTE]` del Problem Brief con lo que salga de aquí.
3. Guarda las notas en el repo, no solo en el brief. El syllabus evalúa
   *"la evidencia efectivamente publicada en el repositorio"*.
4. Si algo te refuta, **dilo en el brief**. Un brief que documenta un
   supuesto caído y explica cómo se ajusta el proyecto demuestra más método
   que uno donde todo salió perfecto. Eso lo nota quien califica.

---

## Si no consigues tres entrevistas antes del sábado

Plan de respaldo, en orden:

1. **Discord del bootcamp** — hay gente que trabaja en esto y a la que le
   sirve que le preguntes. Además te hace visible ante el equipo académico.
2. **Asesoría del viernes** — no es una entrevista de usuario, pero un
   mentor de BAF/Stellar te da señal sobre el encaje del problema.
   Inscripción **hasta el viernes 8:00 a.m.**
3. **Tu propio caso, documentado con rigor** — fechas, cifras reales,
   capturas sin datos de clientes. Es evidencia legítima y la docente
   misma dijo que el mejor problema es uno que ya viviste. Pero cuenta
   como **una** fuente, no como tres: decláralo así en el brief.
