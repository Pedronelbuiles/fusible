# Historias de usuario individuales

**Nombre:** Pedro Nel Builes Moreno

**Usuario de GitHub:** [@Pedronelbuiles](https://github.com/Pedronelbuiles)

---

## Mis historias de usuario

> Entre 5 y 7 historias en formato "como [rol] quiero [acción] para [beneficio]", pensadas desde distintos roles o necesidades del producto que el equipo está diseñando.

1. Como **responsable del presupuesto** quiero fijar un tope de gasto antes
   de poner a operar un agente para que la pérdida máxima quede definida
   desde el primer minuto y no dependa de que yo esté mirando.

2. Como **responsable del presupuesto** quiero cortar en cualquier momento
   el acceso del agente a los fondos para detener un incidente sin tener que
   apagar el sistema completo.

3. Como **responsable de seguridad** quiero restringir a qué destinos puede
   pagar el agente para que un agente manipulado no pueda desviar fondos a
   una dirección que nadie autorizó.

4. Como **responsable de seguridad** quiero consultar el registro de pagos y
   de intentos bloqueados sin depender del proveedor que cobró para
   investigar un incidente con evidencia que ninguna de las partes controla.

5. Como **responsable del presupuesto** quiero ver el gasto acumulado del
   agente mientras ocurre para no enterarme al cierre del ciclo de
   facturación.

6. Como **desarrollador que integra el agente** quiero que pagar por un
   servicio sea una sola llamada dentro del presupuesto asignado para no
   tener que montar una pasarela de pagos ni custodiar credenciales.

7. Como **responsable financiero** quiero que cada agente tenga su propio
   presupuesto identificable para imputar el gasto a su proyecto o cliente
   sin repartir a mano una factura consolidada.

## La más importante y por qué

> Organiza las historias de mayor a menor importancia: en la primera fila va la más importante.

| Orden de importancia | Historia # | Por qué |
| :---: | :---: | --- |
| 1 (la más importante) | 1 | Es el producto. Sin un tope que el agente no pueda exceder, todo lo demás es cosmético: se puede observar, alertar y registrar, pero nada detiene la pérdida. Es además la única historia que, por sí sola, ya resuelve el problema del Problem Brief. |
| 2 | 2 | Es la contención. El tope define el peor caso; la revocación permite no llegar a él. Juntas convierten el problema de un sobrecosto en un incidente acotado, que es el cambio de categoría que persigue el proyecto. |
| 3 | 3 | Un tope limita *cuánto*, la lista de destinos limita *hacia dónde*. Sin ella, un agente manipulado puede agotar el presupuesto completo en un solo pago a una dirección hostil, dentro de las reglas. |
| 4 | 4 | Es la señal de pertinencia que justifica la tecnología elegida: un registro que no pertenece a quien cobró. No previene el daño, pero es lo único que permite repartir responsabilidad después. |
| 5 | 5 | Mejora mucho la experiencia y es la pantalla que hace demostrable el producto, pero es información: no previene ni detiene. Con las cuatro anteriores, el usuario ya está protegido aunque no esté mirando. |
| 6 | 6 | Es adopción, no protección. Importa para que alguien lo use en serio, pero el valor se puede demostrar con una integración mínima y sin pulir la experiencia del desarrollador. |
| 7 (la menos importante) | 7 | Resuelve una fricción real (F7 del Problem Brief), pero es ahorro de esfuerzo administrativo. Es la única de la lista que no toca el riesgo, y por eso es la primera que se puede aplazar. |
