# 🚀 Phoenix Arena CTF - Production Deployment Guide

This guide covers secure deployment of Phoenix Arena CTF on VPS with Docker and Caddy reverse proxy.

## 🔒 Security Features

- **Non-root containers** with minimal privileges
- **Security headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Rate limiting** to prevent abuse
- **Read-only filesystem** where possible
- **Health checks** for container monitoring
- **Automatic SSL** with Let's Encrypt (when using domain)

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ or similar
- Domain name (optional, for HTTPS)
- Root or sudo access
- Docker and Docker Compose

## 🛠️ Quick Deployment

### 1. Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install firewall
apt install -y ufw
ufw allow 22/tcp
ufw allow 80,443/tcp
ufw --force enable
```

### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/asynchronous-x/orbital-ctf.git
cd orbital-ctf

# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 3. Environment Variables

Update `.env` with your values:

```env
# Database
DATABASE_URL="file:/app/prisma/dev.db"

# NextAuth (REQUIRED: Change this!)
NEXTAUTH_SECRET="your-very-secure-secret-here"
NEXTAUTH_URL="https://yourdomain.com"  # or http://your-ip for testing

# Challenge Configuration
INGEST_CHALLENGES_AT_STARTUP=false
CHALLENGES_DIR="/challenges"

# Environment
NODE_ENV="production"
```

### 4. Caddy Configuration

For **HTTP only** (IP address):
```bash
# Caddyfile is already configured for :80
# No changes needed
```

For **HTTPS with domain**:
```bash
# Edit Caddyfile and replace :80 with your domain
nano Caddyfile
```

Replace the first line:
```
# Change this:
:80 {

# To this:
yourdomain.com {
```

### 5. Deploy

```bash
# Build and start services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f app
```

### 6. Verify Deployment

- **HTTP**: `http://your-ip` or `http://yourdomain.com`
- **HTTPS**: `https://yourdomain.com` (if domain configured)
- **Health check**: `http://your-ip/api/health`

## 🔧 Management Commands

### Update Application
```bash
cd /path/to/orbital-ctf
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f caddy
```

### Backup Data
```bash
# Backup database
docker run --rm -v orbital-ctf_sqlite_data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz -C /data .

# Backup uploads
docker run --rm -v orbital-ctf_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart app
```

## 🛡️ Security Hardening

### Additional VPS Security

```bash
# Create non-root user
adduser deploy
usermod -aG sudo deploy

# Configure SSH (optional)
sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Install fail2ban
apt install -y fail2ban
systemctl enable fail2ban
```

### Container Security

The production setup includes:
- Non-root user execution
- Read-only filesystem
- Dropped capabilities
- Security headers
- Rate limiting
- Health checks

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # if Apache is running
   ```

2. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/orbital-ctf
   ```

3. **Container won't start**
   ```bash
   docker compose -f docker-compose.prod.yml logs app
   ```

4. **Database issues**
   ```bash
   # Reset database
   docker compose -f docker-compose.prod.yml down
   docker volume rm orbital-ctf_sqlite_data
   docker compose -f docker-compose.prod.yml up -d
   ```

### Health Check

Monitor application health:
```bash
curl http://your-ip/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

## 📊 Monitoring

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Log Rotation
```bash
# Configure log rotation for Caddy
sudo nano /etc/logrotate.d/caddy
```

Add:
```
/var/log/caddy/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
}
```

## 🔄 Updates

### Application Updates
```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Security Updates
```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/asynchronous-x/orbital-ctf/issues)
- **Documentation**: [README.md](README.md)
- **Security**: Report security issues privately

---

**🔥 Ready to rise in the Phoenix Arena! 🔥**