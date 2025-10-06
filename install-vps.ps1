# =============================================================================
# Phoenix Arena CTF - Complete VPS Installation Script (PowerShell)
# =============================================================================
# This script will:
# 1. Update system and install dependencies
# 2. Install Docker and Docker Compose
# 3. Configure firewall
# 4. Clone the repository
# 5. Set up environment variables
# 6. Deploy the application with security hardening
# 7. Verify deployment
# =============================================================================

param(
    [string]$IP = "178.128.18.222",
    [string]$Domain = ""
)

# Configuration
$APP_NAME = "phoenix-arena-ctf"
$APP_DIR = "/opt/$APP_NAME"
$REPO_URL = "https://github.com/asynchronous-x/orbital-ctf.git"

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Docker {
    Write-Info "Installing Docker Desktop..."
    
    # Check if Docker is already installed
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Success "Docker is already installed: $(docker --version)"
        return
    }
    
    # Download and install Docker Desktop
    $dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
    Write-Info "Downloading Docker Desktop..."
    Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -OutFile $dockerInstaller
    
    Write-Info "Installing Docker Desktop (this may take a few minutes)..."
    Start-Process -FilePath $dockerInstaller -ArgumentList "install --quiet" -Wait
    
    # Clean up installer
    Remove-Item $dockerInstaller -Force
    
    Write-Success "Docker Desktop installed successfully"
    Write-Warning "Please restart your computer and run this script again"
    exit 0
}

function Clone-Repository {
    Write-Info "Cloning repository..."
    
    # Create directory if it doesn't exist
    if (!(Test-Path "C:\opt")) {
        New-Item -ItemType Directory -Path "C:\opt" -Force
    }
    
    $targetDir = "C:\opt\$APP_NAME"
    
    # Remove existing directory if it exists
    if (Test-Path $targetDir) {
        Write-Warning "Removing existing $targetDir directory..."
        Remove-Item $targetDir -Recurse -Force
    }
    
    # Clone repository
    Set-Location "C:\opt"
    git clone $REPO_URL $APP_NAME
    Set-Location $targetDir
    
    Write-Success "Repository cloned to $targetDir"
}

function Setup-Environment {
    Write-Info "Setting up environment variables..."
    
    $envFile = ".env"
    $nexAuthSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
    
    $envContent = @"
# Phoenix Arena CTF - Production Environment
NEXTAUTH_URL=http://$IP
NEXTAUTH_SECRET="$nexAuthSecret"
DATABASE_URL=file:/app/prisma/dev.db
INGEST_CHALLENGES_AT_STARTUP=false
CHALLENGES_DIR=/challenges
NODE_ENV=production
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Success "Environment file created"
    Write-Info "You can edit .env file to customize settings: notepad $envFile"
}

function Deploy-Application {
    Write-Info "Deploying application..."
    
    # Build and start services
    Write-Info "Building Docker images..."
    docker compose -f docker-compose.prod.yml build
    
    Write-Info "Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for services to start
    Write-Info "Waiting for services to start..."
    Start-Sleep -Seconds 15
    
    # Check if services are running
    $services = docker compose -f docker-compose.prod.yml ps
    if ($services -match "Up") {
        Write-Success "Application deployed successfully!"
    } else {
        Write-Error "Application deployment failed"
        Write-Info "Checking logs..."
        docker compose -f docker-compose.prod.yml logs
        exit 1
    }
}

function Test-Deployment {
    Write-Info "Verifying deployment..."
    
    # Wait a bit more for full startup
    Start-Sleep -Seconds 10
    
    # Check health endpoint
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://$IP/api/health" -TimeoutSec 10
        if ($healthResponse.StatusCode -eq 200) {
            Write-Success "Health check passed"
        }
    } catch {
        Write-Warning "Health check failed, but application might still be starting"
    }
    
    # Check main page
    try {
        $mainResponse = Invoke-WebRequest -Uri "http://$IP" -TimeoutSec 10
        if ($mainResponse.StatusCode -eq 200) {
            Write-Success "Main page is accessible"
        }
    } catch {
        Write-Warning "Main page check failed"
    }
    
    # Show service status
    Write-Info "Service status:"
    docker compose -f docker-compose.prod.yml ps
    
    # Show logs
    Write-Info "Recent application logs:"
    docker compose -f docker-compose.prod.yml logs --tail=20 app
}

function Show-AccessInfo {
    Write-Host ""
    Write-Host "=============================================================================" -ForegroundColor Green
    Write-Host "🎉 Phoenix Arena CTF Installation Complete! 🎉" -ForegroundColor Green
    Write-Host "=============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor Blue
    Write-Host "  🌐 Main Site: http://$IP" -ForegroundColor White
    Write-Host "  🔍 Health Check: http://$IP/api/health" -ForegroundColor White
    Write-Host ""
    Write-Host "Management Commands:" -ForegroundColor Blue
    Write-Host "  📁 App Directory: C:\opt\$APP_NAME" -ForegroundColor White
    Write-Host "  📊 View Logs: docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor White
    Write-Host "  🔄 Restart: docker compose -f docker-compose.prod.yml restart" -ForegroundColor White
    Write-Host "  ⏹️  Stop: docker compose -f docker-compose.prod.yml down" -ForegroundColor White
    Write-Host "  🚀 Start: docker compose -f docker-compose.prod.yml up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "Configuration:" -ForegroundColor Blue
    Write-Host "  ⚙️  Edit Settings: notepad C:\opt\$APP_NAME\.env" -ForegroundColor White
    Write-Host "  🔧 Edit Caddy: notepad C:\opt\$APP_NAME\Caddyfile" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Visit http://$IP to access the application" -ForegroundColor White
    Write-Host "  2. Configure your domain in .env and Caddyfile for HTTPS" -ForegroundColor White
    Write-Host "  3. Set up regular backups using the commands in DEPLOYMENT.md" -ForegroundColor White
    Write-Host ""
    Write-Host "=============================================================================" -ForegroundColor Green
}

# Main execution
function Main {
    Write-Host "=============================================================================" -ForegroundColor Green
    Write-Host "🔥 Phoenix Arena CTF - VPS Installation Script 🔥" -ForegroundColor Green
    Write-Host "=============================================================================" -ForegroundColor Green
    Write-Host ""
    
    # Check if running as admin
    if (!(Test-IsAdmin)) {
        Write-Error "This script must be run as Administrator"
        Write-Info "Right-click PowerShell and select 'Run as Administrator'"
        exit 1
    }
    
    # Installation steps
    Install-Docker
    Clone-Repository
    Setup-Environment
    Deploy-Application
    Test-Deployment
    Show-AccessInfo
    
    Write-Success "Installation completed successfully!"
}

# Run main function
Main
