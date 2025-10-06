Write-Host "PHOENIX ARENA CTF - Service Status Check" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Yellow

# Check Next.js Dev Server (try both 3000 and 3001)
$nextjs3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$nextjs3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($nextjs3000) {
    Write-Host "✅ Next.js Dev Server: RUNNING on http://localhost:3000" -ForegroundColor Green
    $global:NextJSPort = 3000
} elseif ($nextjs3001) {
    Write-Host "✅ Next.js Dev Server: RUNNING on http://localhost:3001" -ForegroundColor Green
    $global:NextJSPort = 3001
} else {
    Write-Host "❌ Next.js Dev Server: NOT RUNNING" -ForegroundColor Red
    $global:NextJSPort = $null
}

# Check ngrok
$ngrok = Get-NetTCPConnection -LocalPort 4040 -ErrorAction SilentlyContinue
if ($ngrok) {
    Write-Host "✅ ngrok Dashboard: RUNNING on http://localhost:4040" -ForegroundColor Green
    
    # Try to get ngrok tunnel URL
    try {
        $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
        if ($tunnels.tunnels -and $tunnels.tunnels.Count -gt 0) {
            $publicUrl = $tunnels.tunnels[0].public_url
            Write-Host "🌐 Public URL: $publicUrl" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  ngrok tunnel not established yet" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not retrieve tunnel info" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ ngrok: NOT RUNNING" -ForegroundColor Red
}

# Check Prisma Studio
$prisma = Get-NetTCPConnection -LocalPort 5555 -ErrorAction SilentlyContinue
if ($prisma) {
    Write-Host "✅ Prisma Studio: RUNNING on http://localhost:5555" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma Studio: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""
if ($global:NextJSPort) {
    Write-Host "💡 TIP: Make sure ngrok is pointing to port $global:NextJSPort" -ForegroundColor Yellow
    Write-Host "   Run: ngrok http $global:NextJSPort --log=stdout --region=us" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "PHOENIX ARENA CTF Services Status Complete!" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Yellow
