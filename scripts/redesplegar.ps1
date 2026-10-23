# Vuelve a poner Fusible en pie después de un reinicio de la testnet.
#
# Qué sobrevive a un reinicio y qué no:
#   - Las LLAVES sobreviven: viven en tu máquina, no en la red. Las
#     direcciones G... siguen siendo las mismas.
#   - Las CUENTAS no: hay que volver a fondearlas con Friendbot.
#   - El CONTRATO no: hay que desplegarlo otra vez, y su id CAMBIA.
#   - Los FUSIBLES no: se crean de nuevo.
#
# Uso:  .\scripts\redesplegar.ps1
#   o:  powershell -ExecutionPolicy Bypass -File .\scripts\redesplegar.ps1

# El Stellar CLI escribe sus mensajes de progreso en stderr. Con
# ErrorActionPreference='Stop', PowerShell los trataría como error fatal, así
# que se deja en Continue y se comprueba $LASTEXITCODE a mano.
$ErrorActionPreference = 'Continue'

$raiz   = Split-Path -Parent $PSScriptRoot
$cli    = Join-Path "C:\Program Files (x86)\Stellar CLI" "stellar.exe"
$cargo  = "C:\Users\pedro.builes\.cargo\bin"
$wasm   = Join-Path $raiz "contracts\target\wasm32v1-none\release\fusible.wasm"
$envFile = Join-Path $raiz "frontend\.env"

if (-not (Test-Path $cli)) { throw "No encuentro el Stellar CLI en $cli" }
$env:PATH = "$cargo;$env:PATH"

function Paso($n, $texto) { Write-Host "`n[$n] $texto" -ForegroundColor Cyan }

# Ejecuta el CLI y devuelve su salida combinada, fallando solo si el código
# de salida no es 0.
function Invoke-Stellar {
    $salida = & $cli @args 2>&1 | ForEach-Object { "$_" }
    if ($LASTEXITCODE -ne 0) {
        $salida | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        throw "El comando falló: stellar $($args -join ' ')"
    }
    return $salida
}

# ---------------------------------------------------------------- 1. cuentas
Paso 1 "Volviendo a fondear las identidades con Friendbot"
foreach ($k in @('fusible-dueno', 'fusible-agente', 'fusible-svc1', 'fusible-svc2')) {
    & $cli keys fund $k --network testnet 2>&1 | Out-Null
    $addr = (Invoke-Stellar keys address $k) | Select-Object -Last 1
    Write-Host "    $k -> $addr"
}

# --------------------------------------------------------------- 2. compilar
Paso 2 "Compilando el contrato"
Push-Location (Join-Path $raiz "contracts")
cargo build --target wasm32v1-none --release 2>&1 | Select-String -Pattern "^error|Finished"
Pop-Location
if (-not (Test-Path $wasm)) { throw "No se generó el wasm en $wasm" }
Write-Host ("    wasm: " + (Get-Item $wasm).Length + " bytes")

# -------------------------------------------------------------- 3. desplegar
Paso 3 "Desplegando en testnet"
$salida = Invoke-Stellar contract deploy --wasm $wasm --source fusible-dueno --network testnet
$contrato = ($salida | Select-String -Pattern '^C[A-Z2-7]{55}$' | Select-Object -Last 1).Matches.Value
if (-not $contrato) {
    $salida | Write-Host
    throw "No pude leer el id del contrato en la salida del despliegue"
}
Write-Host "    contrato: $contrato" -ForegroundColor Green

# ------------------------------------------------------- 4. fusible de demo
Paso 4 "Creando un fusible de demostración"
$tok  = (Invoke-Stellar contract id asset --asset native --network testnet) | Select-Object -Last 1
$own  = (Invoke-Stellar keys address fusible-dueno)  | Select-Object -Last 1
$agt  = (Invoke-Stellar keys address fusible-agente) | Select-Object -Last 1
$d1   = (Invoke-Stellar keys address fusible-svc1)   | Select-Object -Last 1
$d2   = (Invoke-Stellar keys address fusible-svc2)   | Select-Object -Last 1
$venc = [int][double]::Parse((Get-Date -UFormat %s)) + 2592000   # 30 días

# Ojo: estas dos van directas, sin el helper. PowerShell elimina el "--"
# separador cuando los argumentos pasan por @args, y el CLI lo necesita para
# saber dónde empiezan los parámetros de la función del contrato.
# Dos cosas que hay que respetar aquí:
#  1. Cada invocación va en UNA línea: el backtick de continuación justo
#     después del separador "--" confunde al parser de PowerShell.
#  2. La lista de destinos va por ARCHIVO. Si se pasa como argumento,
#     PowerShell se come las comillas internas del JSON y el CLI recibe
#     [G...,G...] sin comillas, que no es JSON válido.
$destinosJson = Join-Path $env:TEMP "fusible-destinos.json"
Set-Content -Path $destinosJson -Value (ConvertTo-Json @($d1, $d2) -Compress) -Encoding ascii

$r1 = & $cli contract invoke --id $contrato --source fusible-dueno --network testnet -- create_fuse --owner $own --nombre "Agente de demostracion" --agent $agt --token $tok --tope_total 1000000000 --tope_por_op 150000000 --destinos-file-path $destinosJson --vigencia_hasta $venc 2>&1
if ($LASTEXITCODE -ne 0) { $r1 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }; throw "Falló create_fuse" }

$r2 = & $cli contract invoke --id $contrato --source fusible-dueno --network testnet -- fund --id 1 --amount 500000000 2>&1
if ($LASTEXITCODE -ne 0) { $r2 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }; throw "Falló fund" }
Remove-Item $destinosJson -ErrorAction SilentlyContinue

Write-Host "    fusible #1 creado y fondeado con 50 XLM"

# ------------------------------------------------------------------ 5. .env
Paso 5 "Actualizando frontend/.env"
if (Test-Path $envFile) {
    $contenido = Get-Content $envFile -Raw
    $contenido = $contenido -replace 'VITE_CONTRACT_ID=.*', "VITE_CONTRACT_ID=$contrato"
    $contenido = $contenido -replace 'VITE_TOKEN_ID=.*',    "VITE_TOKEN_ID=$tok"
    Set-Content -Path $envFile -Value $contenido -NoNewline
    Write-Host "    VITE_CONTRACT_ID actualizado"
} else {
    Write-Host "    no existe frontend\.env; cópialo de .env.example" -ForegroundColor Yellow
}

# ------------------------------------------------------------------- cierre
Write-Host "`n=================================================" -ForegroundColor Green
Write-Host " Listo. Contrato nuevo:" -ForegroundColor Green
Write-Host " $contrato"
Write-Host "=================================================" -ForegroundColor Green
Write-Host @"

FALTA UN PASO MANUAL, y sin él el sitio publicado sigue roto:

  Vercel -> Settings -> Environment Variables
  VITE_CONTRACT_ID = $contrato
  y vuelve a desplegar (Deployments -> ... -> Redeploy)

Y actualiza el id en la documentación:
  docs/semana4/MVPFunctional.md, docs/proyecto.md, README.md

Para comprobar que quedó bien:
  https://stellar.expert/explorer/testnet/contract/$contrato
"@
