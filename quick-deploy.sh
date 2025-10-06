#!/bin/bash

# =============================================================================
# Phoenix Arena CTF - Quick Deploy Script
# =============================================================================
# One-liner deployment for existing VPS with Docker installed
# Usage: curl -sSL https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/main/quick-deploy.sh | bash
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔥 Phoenix Arena CTF - Quick Deploy 🔥${NC}"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")

# Create app directory
mkdir -p /opt/phoenix-arena-ctf
cd /opt/phoenix-arena-ctf

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull
else
    echo "Cloning repository..."
    git clone https://github.com/asynchronous-x/orbital-ctf.git .
fi

# Create .env file
cat > .env << EOF
NEXTAUTH_URL=http://$SERVER_IP
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
DATABASE_URL=file:/app/prisma/dev.db
INGEST_CHALLENGES_AT_STARTUP=false
CHALLENGES_DIR=/challenges
NODE_ENV=production
EOF

# Deploy
echo "Deploying application..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Wait and verify
echo "Waiting for services to start..."
sleep 15

echo -e "${GREEN}🎉 Deployment Complete! 🎉${NC}"
echo "Access your CTF platform at: http://$SERVER_IP"
echo "Health check: http://$SERVER_IP/api/health"
echo ""
echo "Management commands:"
echo "  View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  Restart: docker compose -f docker-compose.prod.yml restart"
echo "  Stop: docker compose -f docker-compose.prod.yml down"
