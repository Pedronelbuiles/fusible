# Fusible

**Un presupuesto con límites para programas de inteligencia artificial que
pagan solos.**

Hoy, para que un programa autónomo pueda pagar por los servicios que
consume, hay que entregarle una credencial con un medio de pago detrás y
gasto ilimitado. No existe el tope duro, no existe la lista de destinos
permitidos, no existe el interruptor de corte, y el registro de lo que gastó
lo lleva el mismo proveedor que le cobró.

Fusible es ese límite: un contrato que guarda el presupuesto de un programa
y lo libera solo bajo reglas que ni el programa ni su autor pueden cambiar
después.

---

## Qué hace

| | |
|---|---|
| **Tope total y por operación** | La pérdida máxima queda definida antes de soltar el programa |
| **Lista de destinos permitidos** | Solo se puede pagar a direcciones autorizadas de antemano |
| **Corte en caliente** | El dueño detiene el gasto de forma inmediata e irreversible |
| **Registro independiente** | Cada pago y cada intento bloqueado quedan registrados fuera del control de las partes |

---

## Estado

Proyecto en desarrollo dentro de **Blockchain Builders 101**, programa de
Blockchain Acceleration Foundation, Ruta N Medellín y Stellar
(22 de septiembre – 26 de octubre de 2026).

| Semana | Entregable | Estado |
|---|---|---|
| 1 | Problem brief | Entregado |
| 2 | Product blueprint | Entregado |
| 3 | Functional proof | Entregado |
| 4 | Validated MVP | Pendiente |
| 5 | Demo package | Pendiente |

---

## Estructura

```
frontend/            Interfaz del producto (Vite + React + TypeScript)
docs/
├── entrevistas/     Notas de validación con usuarios
├── proyecto.md      Este documento
├── semana1/         Problem brief y propuesta individual
├── semana2/         Product blueprint, historias, lean canvas y arquitectura
├── semana3/         Documentación del front y decisión técnica
├── semana4/         Validated MVP
└── semana5/         Demo package
```

En la semana 4 se incorpora `contracts/` con el contrato en Soroban.

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
