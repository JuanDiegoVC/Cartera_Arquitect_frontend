# Script para iniciar túnel ngrok para el frontend React
# Puerto: 5173

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Iniciando túnel ngrok - Frontend" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok está instalado
if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: ngrok no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Descarga ngrok desde: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Verificar si el servidor Vite está corriendo
$viteRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if (-not $viteRunning) {
    Write-Host "ADVERTENCIA: El servidor Vite no parece estar corriendo en el puerto 5173" -ForegroundColor Yellow
    Write-Host "Asegúrate de ejecutar 'npm run dev' primero" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($continue -ne 's' -and $continue -ne 'S') {
        exit 0
    }
}

# Verificar si .env.production existe
if (-not (Test-Path ".env.production")) {
    Write-Host "ADVERTENCIA: No se encontró .env.production" -ForegroundColor Yellow
    Write-Host "Asegúrate de haber configurado VITE_API_URL con la URL del backend ngrok" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Iniciando túnel ngrok para el frontend (puerto 5173)..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Esta será la URL pública para acceder a tu aplicación" -ForegroundColor Yellow
Write-Host ""
Write-Host "Dashboard de ngrok: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""

# Iniciar ngrok usando la configuración del archivo ngrok.yml del backend
ngrok start react-frontend --config ..\sotrap-backend\ngrok.yml
