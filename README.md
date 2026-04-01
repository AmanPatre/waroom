# WAROOM Setup (Phase 0)

This project has two parts:
- Rust SpacetimeDB module in the repo root
- React client in client/

## Toolchain (latest stable used)

Verified in this workspace:
- Node.js: 24.12.0
- npm: 11.6.2
- Rust: 1.94.1
- cargo: 1.94.1
- Spacetime CLI: 2.1.0
- wasm target: wasm32-unknown-unknown

## 1) Install prerequisites

### Windows PowerShell

Install Rust:
```powershell
winget install --id Rustlang.Rustup -e --accept-package-agreements --accept-source-agreements
```

Install Spacetime CLI (official):
```powershell
iwr https://windows.spacetimedb.com -UseBasicParsing | iex
```

Install Node.js LTS/current if missing:
```powershell
winget install OpenJS.NodeJS -e --accept-package-agreements --accept-source-agreements
```

Add wasm target:
```powershell
rustup target add wasm32-unknown-unknown
```

## 2) Configure environment

Create .env in repo root (already templated from .env.example):

```env
GEMINI_API_KEY=replace_with_real_gemini_key
MEM0_API_KEY=replace_with_real_mem0_key
VITE_STDB_URI=ws://localhost:3000
VITE_STDB_DB_NAME=warroom
```

## 3) Install frontend dependencies

```bash
cd client
npm install
```

## 4) Generate Spacetime bindings

From client/:

```bash
set -a && source ../.env && set +a
npm run generate-bindings
```

Current script uses latest CLI flags:
- spacetime generate --module-path .. --lang typescript --out-dir src/module_bindings
- Windows fallback if PATH is stale in current shell:
	- %LOCALAPPDATA%\\SpacetimeDB\\spacetime.exe generate --module-path .. --lang typescript --out-dir src/module_bindings

## 5) Build/verify gates

### Git Bash

Backend compile check:
```bash
cd ..
export PATH="/c/Users/$USERNAME/AppData/Local/SpacetimeDB:$HOME/.cargo/bin:$PATH"
set -a && source ./.env && set +a
cargo check
```

Frontend production build:
```bash
cd client
npm run build
```

## 6) Optional local runtime

Start local SpacetimeDB server:
```bash
spacetime start
```

## Notes

- If spacetime is not found in the current shell after installation, open a new terminal session.
- Bindings generation compiles the Rust module; missing GEMINI_API_KEY or MEM0_API_KEY will fail build-time checks.
- wasm-opt is optional; if missing, bindings still generate and builds still pass.
