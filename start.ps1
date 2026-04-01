# Load .env variables into the current PowerShell session
Get-Content .env | ForEach-Object {
    if ($_ -match '^(\w+)=(.+)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

Write-Host "Environment variables GEMINI_API_KEY and MEM0_API_KEY loaded successfully from .env." -ForegroundColor Green

# Optional: Prompt user if they want to build & publish the backend
$response = 'y'
if ($response -eq 'y') {
    Write-Host "Building WASM module (with API keys)..."
    cargo build --release --target wasm32-unknown-unknown
    Write-Host "Build done!" -ForegroundColor Green

    Write-Host "Publishing to local SpacetimeDB server..."
    spacetime publish --server local -y --bin-path "target\wasm32-unknown-unknown\release\warroom.wasm" warroom
    Write-Host "Backend published!" -ForegroundColor Green

    # Generate module bindings from compiled wasm binary
    Write-Host "Generating TS Module Bindings for client..."
    spacetime generate --lang typescript --out-dir client\src\module_bindings --bin-path "target\wasm32-unknown-unknown\release\warroom.wasm"
    Write-Host "Module bindings generated!" -ForegroundColor Green
} else {
    Write-Host "Skipping publish. You can manually publish using 'spacetime publish -c warroom'."
}

Write-Host "Ready to run Vite Frontend. Navigate to \client and run 'npm run dev'!" -ForegroundColor Cyan
