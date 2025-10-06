#!/bin/bash

# =============================================================================
# Phoenix Arena CTF - One-Click Deploy with Maximum Security & HTTPS
# =============================================================================
# Usage: curl -sSL https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/main/one-click-deploy.sh | bash -s -- yourdomain.com
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get domain from parameter
DOMAIN="$1"

if [[ -z "$DOMAIN" ]]; then
    echo -e "${RED}Error: Domain is required${NC}"
    echo "Usage: curl -sSL https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/main/one-click-deploy.sh | bash -s -- yourdomain.com"
    exit 1
fi

echo -e "${BLUE}🔥 Phoenix Arena CTF - One-Click Deploy 🔥${NC}"
echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}This script must be run as root${NC}"
    echo "Please run: sudo bash <(curl -sSL https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/main/one-click-deploy.sh) $DOMAIN"
    exit 1
fi

# Update system
echo -e "${BLUE}Updating system...${NC}"
apt update -y && apt upgrade -y

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
apt install -y curl wget git ufw fail2ban unattended-upgrades htop

# Install Docker
echo -e "${BLUE}Installing Docker...${NC}"
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# Configure firewall
echo -e "${BLUE}Configuring firewall...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup application
echo -e "${BLUE}Setting up application...${NC}"
mkdir -p /opt/phoenix-arena-ctf
cd /opt/phoenix-arena-ctf

# Clone repository
if [[ -d ".git" ]]; then
    git pull
else
    git clone https://github.com/asynchronous-x/orbital-ctf.git .
fi

# Create .env
cat > .env << EOF
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
DATABASE_URL=file:/app/prisma/dev.db
INGEST_CHALLENGES_AT_STARTUP=false
CHALLENGES_DIR=/challenges
NODE_ENV=production
EOF

# Create Caddyfile for HTTPS
cat > Caddyfile << EOF
$DOMAIN {
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }
    
    rate_limit {
        zone static {
            key {remote_host}
            events 100
            window 1m
        }
    }
    
    encode zstd gzip
    reverse_proxy app:3000
}

http://$DOMAIN {
    redir https://$DOMAIN{uri} permanent
}
EOF

# Deploy
echo -e "${BLUE}Deploying application...${NC}"
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Wait for startup
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 30

# Verify
echo -e "${BLUE}Verifying deployment...${NC}"
if curl -sf https://$DOMAIN/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but application may still be starting${NC}"
fi

# Show results
echo ""
echo "============================================================================="
echo -e "${GREEN}🎉 Deployment Complete! 🎉${NC}"
echo "============================================================================="
echo ""
echo -e "${BLUE}Access your CTF platform:${NC}"
echo "  🌐 https://$DOMAIN"
echo "  🔍 Health: https://$DOMAIN/api/health"
echo ""
echo -e "${BLUE}Management:${NC}"
echo "  📊 Logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  🔄 Restart: docker compose -f docker-compose.prod.yml restart"
echo "  ⏹️  Stop: docker compose -f docker-compose.prod.yml down"
echo ""
echo -e "${YELLOW}Note: Make sure your domain DNS points to this server's IP${NC}"
echo "============================================================================="
