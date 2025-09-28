# PHOENIX ARENA CTF - Complete Startup Script
# This script starts all services for the PHOENIX ARENA CTF platform

Write-Host "🔥 PHOENIX ARENA CTF - Starting All Services..." -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Red

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Function to wait for a service to be ready
function Wait-ForService {
    param([string]$Url, [string]$ServiceName, [int]$MaxAttempts = 30)
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        
        Write-Host "   Attempt $i/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ $ServiceName failed to start within timeout" -ForegroundColor Red
    return $false
}

# Step 1: Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies if needed
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Setup environment
Write-Host "`n⚙️  Setting up environment..." -ForegroundColor Cyan

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    @'
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="phoenix-arena-secret-2024"
NEXTAUTH_URL="http://localhost:3000"
INGEST_CHALLENGES_AT_STARTUP=true
CHALLENGES_DIR="./challenges"
'@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Create challenges directory if it doesn't exist
if (!(Test-Path "challenges")) {
    Write-Host "📁 Creating challenges directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "challenges" -Force | Out-Null
    Write-Host "✅ challenges directory created" -ForegroundColor Green
}

# Step 4: Setup database
Write-Host "`n🗄️  Setting up database..." -ForegroundColor Cyan

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Reset and seed database
Write-Host "🌱 Resetting and seeding database..." -ForegroundColor Yellow
npx prisma migrate reset --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to reset database" -ForegroundColor Red
    exit 1
}

# Step 5: Create admin accounts
Write-Host "`n👥 Creating admin accounts..." -ForegroundColor Cyan

# Create admin creation script
$adminScript = @'
const { PrismaClient } = require('./prisma/generated/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdminAccounts() {
  console.log('🔥 Creating PHOENIX ARENA admin accounts...');

  const adminAccounts = [
    { alias: 'phoenix1', name: 'Phoenix Admin 1', password: 'phoenix123' },
    { alias: 'phoenix2', name: 'Phoenix Admin 2', password: 'phoenix123' },
    { alias: 'phoenix3', name: 'Phoenix Admin 3', password: 'phoenix123' },
    { alias: 'phoenix4', name: 'Phoenix Admin 4', password: 'phoenix123' },
    { alias: 'phoenix5', name: 'Phoenix Admin 5', password: 'phoenix123' }
  ];

  for (const admin of adminAccounts) {
    try {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      
      await prisma.user.create({
        data: {
          alias: admin.alias,
          name: admin.name,
          password: hashedPassword,
          isAdmin: true,
          isTeamLeader: false
        }
      });

      console.log(`✅ Created: ${admin.alias} (${admin.name})`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  ${admin.alias} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating ${admin.alias}:`, error.message);
      }
    }
  }

  console.log('\n🔥 PHOENIX ARENA admin accounts ready!');
  console.log('👑 Admin Credentials:');
  console.log('   Username: phoenix1, phoenix2, phoenix3, phoenix4, phoenix5');
  console.log('   Password: phoenix123 (for all accounts)');
}

createAdminAccounts()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'@

$adminScript | Out-File -FilePath "create-phoenix-admins.js" -Encoding utf8
node create-phoenix-admins.js
Remove-Item "create-phoenix-admins.js" -Force

# Step 6: Start Next.js development server
Write-Host "`n🚀 Starting PHOENIX ARENA CTF server..." -ForegroundColor Cyan

# Check if port 3000 is already in use
if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use. Stopping existing service..." -ForegroundColor Yellow
    # Try to stop any existing Next.js process
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

# Start Next.js in background
Write-Host "🔥 Starting Next.js development server..." -ForegroundColor Yellow
$nextjsJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Wait for Next.js to be ready
if (Wait-ForService "http://localhost:3000" "PHOENIX ARENA CTF Server" 30) {
    Write-Host "✅ PHOENIX ARENA CTF Server is running!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start PHOENIX ARENA CTF Server" -ForegroundColor Red
    exit 1
}

# Step 7: Start ngrok tunnel
Write-Host "`n🌐 Starting ngrok tunnel..." -ForegroundColor Cyan

# Check if ngrok is installed
try {
    $ngrokVersion = ngrok version
    Write-Host "✅ ngrok is available" -ForegroundColor Green
} catch {
    Write-Host "📥 Installing ngrok..." -ForegroundColor Yellow
    npm install -g ngrok
}

# Start ngrok in background
Write-Host "🔥 Starting ngrok tunnel..." -ForegroundColor Yellow
$ngrokJob = Start-Job -ScriptBlock {
    ngrok http 3000
}

# Wait for ngrok to be ready
Start-Sleep -Seconds 5

# Get ngrok URL
try {
    $ngrokResponse = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -Method GET
    $ngrokData = $ngrokResponse.Content | ConvertFrom-Json
    $publicUrl = $ngrokData.tunnels[0].public_url
    
    Write-Host "✅ ngrok tunnel is active!" -ForegroundColor Green
    Write-Host "🌐 Public URL: $publicUrl" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Could not get ngrok URL, but tunnel should be running" -ForegroundColor Yellow
}

# Step 8: Display final information
Write-Host "`n🔥 PHOENIX ARENA CTF - ALL SYSTEMS ONLINE! 🔥" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Red
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   🏠 Local:  http://localhost:3000" -ForegroundColor White
Write-Host "   🌍 Public: $publicUrl" -ForegroundColor White
Write-Host ""
Write-Host "👑 Admin Accounts:" -ForegroundColor Cyan
Write-Host "   🔑 Username: phoenix1, phoenix2, phoenix3, phoenix4, phoenix5" -ForegroundColor White
Write-Host "   🔒 Password: phoenix123 (for all accounts)" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Management:" -ForegroundColor Cyan
Write-Host "   📊 Prisma Studio: http://localhost:5555" -ForegroundColor White
Write-Host "   🔧 ngrok Dashboard: http://localhost:4040" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C or run: Get-Job | Stop-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "🔥 Welcome to PHOENIX ARENA CTF! Rise to the challenge! 🔥" -ForegroundColor Red

# Keep the script running
Write-Host "`n⏳ Services are running... Press Ctrl+C to stop all services" -ForegroundColor Yellow

try {
    # Monitor the jobs
    while ($true) {
        $nextjsStatus = Get-Job -Id $nextjsJob.Id | Select-Object -ExpandProperty State
        $ngrokStatus = Get-Job -Id $ngrokJob.Id | Select-Object -ExpandProperty State
        
        if ($nextjsStatus -eq "Failed" -or $ngrokStatus -eq "Failed") {
            Write-Host "❌ One or more services failed!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "`n🛑 Stopping all services..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "✅ All services stopped." -ForegroundColor Green
}
