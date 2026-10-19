# Fusible

## Requisitos

- [Node.js](https://nodejs.org) 20.19 o superior
- npm 10 o superior (viene con Node)

Comprueba las versiones con:

```bash
node --version
npm --version
```

## Instalación

```bash
git clone https://github.com/Pedronelbuiles/fusible.git
cd fusible/frontend
npm install
```

## Cómo correrlo

```bash
npm run dev
```

Abre <http://localhost:5173>.

Para generar la versión de producción y verla localmente:

```bash
npm run build
npm run preview
```

El front arranca conectado al contrato en testnet. Para eso necesita un
`.env` en `frontend/`; copia [`frontend/.env.example`](frontend/.env.example)
y rellena los valores. Sin él, la aplicación funciona igual pero solo con el
recorrido simulado.

## El contrato

Requiere [Rust](https://rustup.rs) 1.84 o superior y el
[Stellar CLI](https://developers.stellar.org/docs/tools/cli) 28.

```bash
rustup target add wasm32v1-none
cd contracts
cargo build --target wasm32v1-none --release
```

El `.wasm` queda en `contracts/target/wasm32v1-none/release/fusible.wasm`.
Para desplegar una instancia propia en testnet:

```bash
stellar contract deploy --wasm target/wasm32v1-none/release/fusible.wasm --source TU_IDENTIDAD --network testnet
```

En Windows, la toolchain `stable-x86_64-pc-windows-gnu` evita tener que
instalar Visual Studio Build Tools.

---

Documentación del proyecto en [`docs/`](docs/). El contrato desplegado:
[CCDIWMOI…UWITZS35](https://stellar.expert/explorer/testnet/contract/CCDIWMOIELVUW77ZA5WEOPUHYYT6D36XIT7XGGU3NP6APTWMUWITZS35).
