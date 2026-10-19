# Volver a levantar Fusible

La red de pruebas de Stellar **se reinicia cada cierto tiempo**. Cuando pasa,
el contrato desaparece y el sitio deja de funcionar. Este documento explica
qué se pierde, qué no, y cómo volver.

---

## Qué sobrevive y qué no

| | ¿Sobrevive? | Por qué |
|---|---|---|
| **Las llaves** | Sí | Viven en tu máquina, en el Stellar CLI. Las direcciones `G…` siguen siendo las mismas |
| **El saldo de las cuentas** | No | Hay que volver a pedirlo a Friendbot |
| **El contrato** | No | Hay que desplegarlo otra vez, y **su identificador cambia** |
| **Los fusibles** | No | Se crean de nuevo |
| **Los hashes antiguos** | No resuelven | Las transacciones existieron, pero el explorador ya no las encuentra |

Lo importante es la primera fila: **no hay que recrear identidades ni
reconfigurar direcciones**. Solo refondear, redesplegar y cambiar un
identificador.

---

## El procedimiento

```powershell
cd C:\Pedro\tempFolders\blockchain\bb101; powershell -ExecutionPolicy Bypass -File .\scripts\redesplegar.ps1
```

El script hace cinco cosas:

1. Vuelve a fondear las cuatro identidades con Friendbot
2. Compila el contrato
3. Lo despliega y captura el identificador nuevo
4. Crea y fondea un fusible de demostración con 50 XLM
5. Actualiza `frontend/.env`

Tarda un par de minutos, casi todo esperando a la red.

### El paso que el script no puede hacer

Al terminar imprime un recordatorio, porque **sin esto el sitio publicado
sigue roto**:

1. **Vercel** → Settings → Environment Variables → `VITE_CONTRACT_ID` con el
   valor nuevo
2. **Vercel** → Deployments → Redeploy (las variables se leen al construir,
   no al servir: sin redesplegar, el cambio no tiene efecto)
3. Actualizar el identificador en `docs/proyecto.md` y `README.md`

---

## Si falla algo

**"No encuentro el Stellar CLI"** — está en `C:\Program Files (x86)\Stellar CLI`.
Si lo instalaste en otro sitio, ajusta la ruta al principio del script.

**Friendbot no responde** — suele ser carga temporal. Espera un minuto y
repite; el script es seguro de volver a correr.

**El despliegue falla por saldo** — las cuentas se quedaron sin XLM. Corre el
script otra vez: el paso 1 vuelve a fondearlas.

**El sitio sigue mostrando el contrato viejo** — falta el redeploy en Vercel.
Cambiar la variable no basta.

---

## Dos detalles de PowerShell que costaron encontrar

Están resueltos en el script, pero si alguna vez escribes comandos a mano
contra el CLI, te los vas a topar:

**El separador `--` se pierde.** Cuando los argumentos pasan por `@args` en
una función de PowerShell, el `--` desaparece, y el CLI lo necesita para
saber dónde empiezan los parámetros de la función del contrato. Las
invocaciones van en una sola línea y sin intermediarios.

**Las comillas del JSON se las come PowerShell.** Pasar
`--destinos "[\"G…\",\"G…\"]"` llega al CLI como `[G…,G…]`, sin comillas, y
falla con *Invalid JSON*. Por eso la lista de destinos se escribe en un
archivo temporal y se pasa con `--destinos-file-path`.
