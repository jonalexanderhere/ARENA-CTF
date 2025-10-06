#!/bin/bash

# =============================================================================
# Phoenix Arena CTF - Complete VPS Installation Script
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

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="phoenix-arena-ctf"
APP_DIR="/opt/$APP_NAME"
REPO_URL="https://github.com/asynchronous-x/orbital-ctf.git"
DEFAULT_IP="178.128.18.222"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        log_info "Usage: sudo bash install-vps.sh"
        exit 1
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        log_error "Cannot determine OS version"
        exit 1
    fi
    
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        log_warning "This script is optimized for Ubuntu/Debian. Proceeding anyway..."
    fi
    
    log_info "Detected OS: $PRETTY_NAME"
}

# Main installation function
install_system() {
    log_info "Updating system packages..."
    apt update -y
    apt upgrade -y
    
    log_info "Installing essential packages..."
    apt install -y curl wget git ufw htop nano unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
}

install_docker() {
    log_info "Installing Docker..."
    
    # Remove old Docker versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install Docker using official script
    curl -fsSL https://get.docker.com | sh
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group (if not root)
    if [[ "$SUDO_USER" ]]; then
        usermod -aG docker "$SUDO_USER"
        log_info "Added $SUDO_USER to docker group"
    fi
    
    # Verify installation
    if docker --version >/dev/null 2>&1; then
        log_success "Docker installed successfully: $(docker --version)"
    else
        log_error "Docker installation failed"
        exit 1
    fi
}

configure_firewall() {
    log_info "Configuring firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow 22/tcp comment 'SSH'
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Enable firewall
    ufw --force enable
    
    log_success "Firewall configured successfully"
}

clone_repository() {
    log_info "Cloning repository..."
    
    # Create directory if it doesn't exist
    mkdir -p /opt
    cd /opt
    
    # Remove existing directory if it exists
    if [[ -d "$APP_DIR" ]]; then
        log_warning "Removing existing $APP_DIR directory..."
        rm -rf "$APP_DIR"
    fi
    
    # Clone repository
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    
    log_success "Repository cloned to $APP_DIR"
}

setup_environment() {
    log_info "Setting up environment variables..."
    
    cd "$APP_DIR"
    
    # Create .env file
    cat > .env << EOF
# Phoenix Arena CTF - Production Environment
NEXTAUTH_URL=http://$DEFAULT_IP
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
DATABASE_URL=file:/app/prisma/dev.db
INGEST_CHALLENGES_AT_STARTUP=false
CHALLENGES_DIR=/challenges
NODE_ENV=production
EOF
    
    log_success "Environment file created"
    log_info "You can edit .env file to customize settings: nano $APP_DIR/.env"
}

deploy_application() {
    log_info "Deploying application..."
    
    cd "$APP_DIR"
    
    # Build and start services
    log_info "Building Docker images..."
    docker compose -f docker-compose.prod.yml build
    
    log_info "Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_success "Application deployed successfully!"
    else
        log_error "Application deployment failed"
        log_info "Checking logs..."
        docker compose -f docker-compose.prod.yml logs
        exit 1
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait a bit more for full startup
    sleep 15
    
    # Check health endpoint
    if curl -s http://$DEFAULT_IP/api/health >/dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_warning "Health check failed, but application might still be starting"
    fi
    
    # Check main page
    if curl -s -I http://$DEFAULT_IP | grep -q "200 OK"; then
        log_success "Main page is accessible"
    else
        log_warning "Main page check failed"
    fi
    
    # Show service status
    log_info "Service status:"
    docker compose -f docker-compose.prod.yml ps
    
    # Show logs
    log_info "Recent application logs:"
    docker compose -f docker-compose.prod.yml logs --tail=20 app
}

show_access_info() {
    echo ""
    echo "============================================================================="
    echo -e "${GREEN}🎉 Phoenix Arena CTF Installation Complete! 🎉${NC}"
    echo "============================================================================="
    echo ""
    echo -e "${BLUE}Access Information:${NC}"
    echo "  🌐 Main Site: http://$DEFAULT_IP"
    echo "  🔍 Health Check: http://$DEFAULT_IP/api/health"
    echo ""
    echo -e "${BLUE}Management Commands:${NC}"
    echo "  📁 App Directory: $APP_DIR"
    echo "  📊 View Logs: docker compose -f docker-compose.prod.yml logs -f"
    echo "  🔄 Restart: docker compose -f docker-compose.prod.yml restart"
    echo "  ⏹️  Stop: docker compose -f docker-compose.prod.yml down"
    echo "  🚀 Start: docker compose -f docker-compose.prod.yml up -d"
    echo ""
    echo -e "${BLUE}Configuration:${NC}"
    echo "  ⚙️  Edit Settings: nano $APP_DIR/.env"
    echo "  🔧 Edit Caddy: nano $APP_DIR/Caddyfile"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Visit http://$DEFAULT_IP to access the application"
    echo "  2. Configure your domain in .env and Caddyfile for HTTPS"
    echo "  3. Set up regular backups using the commands in DEPLOYMENT.md"
    echo ""
    echo "============================================================================="
}

# Main execution
main() {
    echo "============================================================================="
    echo -e "${GREEN}🔥 Phoenix Arena CTF - VPS Installation Script 🔥${NC}"
    echo "============================================================================="
    echo ""
    
    # Pre-flight checks
    check_root
    check_os
    
    # Installation steps
    install_system
    install_docker
    configure_firewall
    clone_repository
    setup_environment
    deploy_application
    verify_deployment
    show_access_info
    
    log_success "Installation completed successfully!"
}

# Run main function
main "$@"
