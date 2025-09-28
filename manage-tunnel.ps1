# PHOENIX ARENA CTF - Tunnel Management Script
# This script helps manage different tunneling options

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("ngrok", "localtunnel", "cloudflare", "network", "status")]
    [string]$Method = "status"
)

Write-Host "🔥 PHOENIX ARENA CTF - Tunnel Manager" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

function Show-Status {
    Write-Host "`n📊 Current Status:" -ForegroundColor Cyan
    
    # Check if Next.js is running
    $nextjs = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($nextjs) {
        Write-Host "✅ Next.js Server: Running on port 3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Next.js Server: Not running" -ForegroundColor Red
        Write-Host "   Start with: npm run dev" -ForegroundColor Yellow
        return
    }
    
    # Check ngrok
    try {
        $ngrokResponse = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 3
        $ngrokData = $ngrokResponse.Content | ConvertFrom-Json
        if ($ngrokData.tunnels.Count -gt 0) {
            $publicUrl = $ngrokData.tunnels[0].public_url
            Write-Host "✅ ngrok Tunnel: $publicUrl" -ForegroundColor Green
        } else {
            Write-Host "❌ ngrok Tunnel: Not active" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ ngrok Tunnel: Not running" -ForegroundColor Red
    }
    
    # Get local IP
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*" }).IPAddress | Select-Object -First 1
    if ($localIP) {
        Write-Host "✅ Network Access: http://$localIP`:3000" -ForegroundColor Green
    }
    
    Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host "   🏠 Local: http://localhost:3000" -ForegroundColor White
    if ($localIP) {
        Write-Host "   🌍 Network: http://$localIP`:3000" -ForegroundColor White
    }
    if ($ngrokData.tunnels.Count -gt 0) {
        Write-Host "   🌐 Public: $publicUrl" -ForegroundColor White
    }
}

function Start-Ngrok {
    Write-Host "`n🚀 Starting ngrok tunnel..." -ForegroundColor Yellow
    
    # Stop existing ngrok
    Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # Start ngrok
    Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -WindowStyle Minimized
    
    Write-Host "⏳ Waiting for ngrok to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
        $data = $response.Content | ConvertFrom-Json
        $publicUrl = $data.tunnels[0].public_url
        Write-Host "✅ ngrok started successfully!" -ForegroundColor Green
        Write-Host "🌐 Public URL: $publicUrl" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to start ngrok. Check if it's installed." -ForegroundColor Red
    }
}

function Start-LocalTunnel {
    Write-Host "`n🚀 Starting LocalTunnel..." -ForegroundColor Yellow
    
    # Check if localtunnel is installed
    try {
        lt --version | Out-Null
    } catch {
        Write-Host "📥 Installing LocalTunnel..." -ForegroundColor Yellow
        npm install -g localtunnel
    }
    
    # Start localtunnel
    Start-Process -FilePath "lt" -ArgumentList "--port", "3000", "--subdomain", "phoenix-arena-ctf" -WindowStyle Minimized
    
    Write-Host "✅ LocalTunnel started!" -ForegroundColor Green
    Write-Host "🌐 Public URL: https://phoenix-arena-ctf.loca.lt" -ForegroundColor Cyan
}

function Start-Cloudflare {
    Write-Host "`n🚀 Starting Cloudflare Tunnel..." -ForegroundColor Yellow
    
    # Check if cloudflared is installed
    try {
        cloudflared --version | Out-Null
    } catch {
        Write-Host "📥 Installing Cloudflared..." -ForegroundColor Yellow
        npm install -g cloudflared
    }
    
    # Start cloudflare tunnel
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--url", "http://localhost:3000" -WindowStyle Minimized
    
    Write-Host "✅ Cloudflare tunnel started!" -ForegroundColor Green
}

function Show-NetworkAccess {
    Write-Host "`n🌍 Network Access Information:" -ForegroundColor Cyan
    
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*" }).IPAddress | Select-Object -First 1
    
    if ($localIP) {
        Write-Host "✅ Local IP: $localIP" -ForegroundColor Green
        Write-Host "🌐 Network URL: http://$localIP`:3000" -ForegroundColor Cyan
        Write-Host "📱 Share this URL with others on the same network" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Could not determine local IP address" -ForegroundColor Red
    }
}

# Main execution
switch ($Method) {
    "ngrok" { Start-Ngrok }
    "localtunnel" { Start-LocalTunnel }
    "cloudflare" { Start-Cloudflare }
    "network" { Show-NetworkAccess }
    "status" { Show-Status }
    default { Show-Status }
}

Write-Host "`n🔥 PHOENIX ARENA CTF - Tunnel Management Complete!" -ForegroundColor Red
