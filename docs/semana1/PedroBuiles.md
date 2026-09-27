# Propuesta individual

**Nombre:** Pedro Nel Builes Moreno

**Usuario de GitHub:** [@Pedronelbuiles](https://github.com/Pedronelbuiles)

---

## El problema

> El problema en una sola frase, sin mencionar blockchain.

Quien construye un programa de inteligencia artificial que actúa por su
cuenta no tiene forma de darle dinero con límites: hoy la única opción es
entregarle una llave con una tarjeta detrás y gasto ilimitado, y si el
programa falla o alguien lo manipula, el daño solo se descubre cuando llega
la factura, semanas después.

## ¿Quién lo sufre?

> Quién tiene el problema y en qué situación lo vive.

Lo sufre quien responde por el presupuesto de un sistema automatizado: el
líder técnico de un equipo de software que tiene procesos de IA corriendo en
producción y que consumen servicios de pago por uso.

La situación concreta es esta: el equipo quiere que el proceso opere sin que
un humano apruebe cada acción, porque ese es justamente el punto de
automatizarlo. Pero para que opere necesita poder pagar, y para poder pagar
hay que darle una credencial conectada a un medio de pago. Esa credencial no
admite un tope real. El resultado es que el responsable queda frente a una
decisión incómoda de forma permanente: o acepta una exposición que no puede
acotar, o mete un humano en el medio y renuncia a la autonomía que buscaba.

También lo sufre, de forma indirecta, quien responde cuando algo sale mal:
seguridad, auditoría o quien tenga que explicar un consumo inesperado sin
más evidencia que el detalle que publica el mismo proveedor que cobró.

## ¿Cómo se resuelve hoy y qué cuesta?

> Cómo lo resuelven hoy las personas afectadas y qué les cuesta en dinero, tiempo o esfuerzo.

Hoy se resuelve de tres maneras, y ninguna resuelve de verdad.

La primera es no ponerle límite y revisar la factura al final del mes. Es la
más común. Cuesta que el desfase entre el gasto y su detección llega a
treinta días: cuando el problema se ve, ya ocurrió completo.

La segunda es poner alertas de consumo. Avisan, pero no detienen. Sirven
para enterarse antes, no para evitar.

La tercera es no automatizar. Se mete a una persona a aprobar el gasto y se
pierde el beneficio entero de tener el proceso corriendo solo. Este costo no
aparece en ninguna factura y probablemente es el más grande de los tres.

A eso se suma un costo fijo de estructura: las pasarelas de pago cobran
alrededor de 2.9% más una tarifa fija por transacción, lo que hace
económicamente inviable el pago por consumo individual, que es exactamente
el patrón que un proceso automático necesita. Y un costo de esfuerzo: repartir
a mano el consumo de una factura consolidada entre equipos, proyectos o
clientes, mes tras mes.

Cuando esto falla, falla completo. Un agente autónomo llegó a desplegar por
su cuenta cinco instancias de cómputo en AWS y acumuló una factura de
USD 6.531 en cerca de un día; su operador se enteró porque la comunidad del
proyecto notó la infraestructura levantada, no por un control propio
([Decrypt](https://decrypt.co/es/371111/agente-ia-autonomo-aws-6531-dolares-donaciones-cripto)).

## ¿Por qué creo que blockchain podría aportar?

> Hipótesis personal, no certeza, apoyada en al menos un criterio de la Sesión 1.

Creo —y lo planteo como hipótesis, no como certeza— que este caso encaja con
dos de los tres criterios que vimos en la Sesión 1.

El primero es el del **intermediario que existe solo para concentrar la
confianza**. La pasarela de pagos y la tarjeta no producen nada en esta
cadena: cobran un porcentaje por ser el tercero en quien ambas partes
confían. Ese porcentaje es tolerable en una compra de cincuenta dólares y es
absurdo en un pago de un centavo, que es la escala a la que opera un proceso
automático. El intermediario no solo cobra: hace imposible el caso de uso.

El segundo es el del **histórico que no puede alterarse ni por quien lo
administra**. Si un proceso autónomo gastó de más, el registro de lo que
gastó lo lleva hoy el mismo proveedor que le cobró. No existe una versión
de los hechos que no sea la de una de las partes interesadas. Para un
incidente —un error del programa, o alguien que lo manipuló— esa es
precisamente la evidencia que uno necesitaría y no tiene.

Mi hipótesis es que si el presupuesto vive en un contrato con reglas que ni
el proceso ni yo podemos cambiar después, y el registro de lo gastado no
pertenece a ninguna de las partes, entonces se puede dejar operar un sistema
autónomo sin exponerse a una pérdida sin techo.

Lo que todavía no sé, y es lo que tengo que validar, es si alguien está
dispuesto a mover el presupuesto de un proceso a un activo digital en vez de
una tarjeta. Ese es el supuesto que puede tumbar toda la idea.
