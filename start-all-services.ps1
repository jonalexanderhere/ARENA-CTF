Write-Host "🔥 STARTING PHOENIX ARENA CTF - ALL SERVICES" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Yellow

# Kill any existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Cyan
taskkill /f /im ngrok.exe 2>$null
taskkill /f /im node.exe 2>$null

Write-Host "⏳ Waiting for cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Next.js Dev Server
Write-Host "🚀 Starting Next.js Dev Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized

# Wait for Next.js to start
Write-Host "⏳ Waiting for Next.js to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Detect which port Next.js is using
$port = 3000
if (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue) {
    $port = 3001
    Write-Host "📍 Next.js detected on port 3001" -ForegroundColor Cyan
} elseif (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) {
    $port = 3000
    Write-Host "📍 Next.js detected on port 3000" -ForegroundColor Cyan
}

# Start ngrok
Write-Host "🌐 Starting ngrok tunnel for port $port..." -ForegroundColor Green
Start-Process ngrok -ArgumentList "http", $port, "--log=stdout", "--region=us" -WindowStyle Minimized

# Start Prisma Studio
Write-Host "🗄️ Starting Prisma Studio..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npx prisma studio --browser none" -WindowStyle Minimized

# Wait for all services to start
Write-Host "⏳ Waiting for all services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
Write-Host ""
Write-Host "📊 CHECKING SERVICE STATUS..." -ForegroundColor Magenta
& "$PWD\check-services.ps1"

Write-Host ""
Write-Host "🎉 PHOENIX ARENA CTF - ALL SERVICES STARTED!" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "🌐 Access your application via the Public URL above" -ForegroundColor Green
Write-Host "🔧 Monitor services: powershell -ExecutionPolicy Bypass -File check-services.ps1" -ForegroundColor Cyan


