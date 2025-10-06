# 🚀 Phoenix Arena CTF - Complete Deployment Guide

This guide provides multiple deployment options with varying levels of automation and security.

## 🎯 Quick Start Options

### 1. ⚡ One-Click Deploy (Fastest)
**Perfect for: Quick testing or simple deployments**

```bash
# Deploy with HTTPS in one command
curl -sSL https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/main/one-click-deploy.sh | bash -s -- yourdomain.com
```

**Features:**
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Basic security headers
- ✅ Rate limiting
- ✅ Firewall configuration
- ✅ 5-minute deployment

### 2. 🔒 Maximum Security Deploy (Recommended)
**Perfect for: Production environments requiring maximum security**

```bash
# Download and run maximum security deployment
curl -sSL https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/main/auto-deploy-secure.sh | sudo bash -s -- yourdomain.com
```

**Features:**
- ✅ **Maximum Security**: Non-root containers, seccomp, AppArmor
- ✅ **HTTPS**: Automatic SSL with Let's Encrypt
- ✅ **Monitoring**: Automated health checks and alerting
- ✅ **Backups**: Daily automated backups
- ✅ **Firewall**: Advanced UFW with iptables rules
- ✅ **Fail2ban**: Intrusion prevention
- ✅ **Logging**: Structured logging with rotation
- ✅ **Updates**: Automatic security updates

### 3. 🛠️ Manual Deploy (Custom)
**Perfect for: Custom configurations or learning**

```bash
# Clone repository
git clone https://github.com/asynchronous-x/orbital-ctf.git
cd orbital-ctf

# Copy environment template
cp env.example .env

# Edit configuration
nano .env

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

## 🔧 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 1GB (2GB recommended)
- **Storage**: Minimum 10GB free space
- **CPU**: 1 vCPU minimum
- **Network**: Public IP with domain pointing to it

### Domain Setup
1. **Purchase domain** from any registrar
2. **Point DNS** to your VPS IP:
   ```
   A record: ctf.yourdomain.com → YOUR_VPS_IP
   ```
3. **Wait for propagation** (5-60 minutes)

## 📋 Deployment Comparison

| Feature | One-Click | Maximum Security | Manual |
|---------|-----------|------------------|--------|
| **Deployment Time** | 5 minutes | 15 minutes | 30+ minutes |
| **HTTPS/SSL** | ✅ Auto | ✅ Auto | ⚙️ Manual |
| **Security Headers** | ✅ Basic | ✅ Advanced | ⚙️ Custom |
| **Rate Limiting** | ✅ Yes | ✅ Advanced | ❌ No |
| **Monitoring** | ❌ No | ✅ Full | ❌ No |
| **Backups** | ❌ No | ✅ Automated | ❌ Manual |
| **Firewall** | ✅ Basic | ✅ Advanced | ⚙️ Manual |
| **Fail2ban** | ❌ No | ✅ Yes | ❌ No |
| **Customization** | ❌ Limited | ⚙️ Medium | ✅ Full |

## 🔒 Security Features

### Maximum Security Deploy Includes:

#### Container Security
- **Non-root execution**: All containers run as non-root user
- **Read-only filesystem**: Immutable container filesystem
- **Dropped capabilities**: Minimal Linux capabilities
- **Seccomp profiles**: Restricted system calls
- **AppArmor**: Mandatory access control

#### Network Security
- **HTTPS only**: Automatic SSL with Let's Encrypt
- **Security headers**: HSTS, CSP, X-Frame-Options, etc.
- **Rate limiting**: DDoS protection
- **Firewall**: Advanced UFW with iptables rules
- **Internal networks**: Isolated container communication

#### System Security
- **Fail2ban**: Intrusion prevention
- **Automatic updates**: Security patches
- **Log rotation**: Prevent disk filling
- **SSH hardening**: Custom port, key-only auth
- **Monitoring**: Health checks and alerting

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# Check application health
curl https://yourdomain.com/api/health

# View container status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Automated Monitoring (Maximum Security)
- **Health checks**: Every 5 minutes
- **Disk space**: Alert at 80% usage
- **Memory usage**: Alert at 90% usage
- **Container status**: Automatic restart on failure
- **Logs**: `/var/log/phoenix-arena-ctf/monitor.log`

### Backup Management
```bash
# Manual backup
/usr/local/bin/ctf-backup.sh

# View backup logs
tail -f /opt/backups/phoenix-arena-ctf/backup.log

# Restore from backup
# (See DEPLOYMENT.md for detailed restore procedures)
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
cd /opt/phoenix-arena-ctf
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Security Updates
```bash
# System updates (automatic with Maximum Security)
apt update && apt upgrade -y

# Docker image updates
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 🚨 Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy

# Verify domain DNS
nslookup yourdomain.com

# Test SSL
curl -I https://yourdomain.com
```

#### 2. Container Won't Start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Check resources
docker stats

# Restart services
docker compose -f docker-compose.prod.yml restart
```

#### 3. Database Issues
```bash
# Reset database
docker compose -f docker-compose.prod.yml down
docker volume rm orbital-ctf_sqlite_data
docker compose -f docker-compose.prod.yml up -d
```

#### 4. Firewall Issues
```bash
# Check firewall status
ufw status

# Check open ports
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

### Performance Optimization

#### Resource Limits
```yaml
# Add to docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

#### Database Optimization
```bash
# For high-traffic deployments, consider PostgreSQL
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/ctf"
```

## 📞 Support

- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/asynchronous-x/orbital-ctf/issues)
- **Security**: Report security issues privately

## 🎯 Recommended Deployment Path

1. **Start with One-Click Deploy** for testing
2. **Upgrade to Maximum Security** for production
3. **Customize as needed** for specific requirements

---

**🔥 Ready to rise in the Phoenix Arena! 🔥**
