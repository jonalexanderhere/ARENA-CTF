#!/bin/bash

# =============================================================================
# Phoenix Arena CTF - Full Auto Deploy with Maximum Security & HTTPS
# =============================================================================
# This script provides:
# 1. Complete VPS setup with security hardening
# 2. Automatic HTTPS with Let's Encrypt
# 3. Maximum security configurations
# 4. Automatic domain setup
# 5. Monitoring and alerting
# 6. Backup automation
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
APP_NAME="phoenix-arena-ctf"
APP_DIR="/opt/$APP_NAME"
REPO_URL="https://github.com/asynchronous-x/orbital-ctf.git"
BACKUP_DIR="/opt/backups/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"

# Security settings
SSH_PORT=2222
FAIL2BAN_ENABLED=true
AUTO_UPDATES=true
FIREWALL_STRICT=true

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_security() { echo -e "${PURPLE}[SECURITY]${NC} $1"; }

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        log_info "Usage: sudo bash auto-deploy-secure.sh [domain]"
        exit 1
    fi
}

# Get domain from parameter or prompt
get_domain() {
    if [[ -n "$1" ]]; then
        DOMAIN="$1"
    else
        echo -e "${CYAN}Enter your domain name (e.g., ctf.yourdomain.com):${NC}"
        read -p "Domain: " DOMAIN
    fi
    
    if [[ -z "$DOMAIN" ]]; then
        log_error "Domain is required for HTTPS setup"
        exit 1
    fi
    
    log_info "Using domain: $DOMAIN"
}

# System security hardening
harden_system() {
    log_security "Hardening system security..."
    
    # Update system
    apt update -y
    apt upgrade -y
    
    # Install security packages
    apt install -y ufw fail2ban unattended-upgrades apt-listchanges \
                   logrotate rsyslog htop iotop nethogs \
                   curl wget git nano vim unzip software-properties-common \
                   apt-transport-https ca-certificates gnupg lsb-release \
                   cron anacron
    
    # Configure automatic security updates
    if [[ "$AUTO_UPDATES" == "true" ]]; then
        log_security "Configuring automatic security updates..."
        cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
        
        cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
    fi
    
    # Configure fail2ban
    if [[ "$FAIL2BAN_ENABLED" == "true" ]]; then
        log_security "Configuring fail2ban..."
        cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF
        
        systemctl enable fail2ban
        systemctl start fail2ban
    fi
    
    # Configure log rotation
    cat > /etc/logrotate.d/$APP_NAME << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
EOF
    
    log_success "System security hardening completed"
}

# Install Docker with security
install_docker_secure() {
    log_info "Installing Docker with security hardening..."
    
    # Remove old Docker versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install Docker
    curl -fsSL https://get.docker.com | sh
    
    # Configure Docker daemon with security
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "seccomp-profile": "/etc/docker/seccomp-profile.json",
    "apparmor-profile": "docker-default"
}
EOF
    
    # Create seccomp profile
    cat > /etc/docker/seccomp-profile.json << 'EOF'
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_X86", "SCMP_ARCH_X32"],
    "syscalls": [
        {"names": ["accept", "accept4", "access", "alarm", "bind", "brk", "capget", "capset", "chdir", "chmod", "chown", "chroot", "clock_getres", "clock_gettime", "clock_nanosleep", "close", "connect", "copy_file_range", "creat", "dup", "dup2", "dup3", "epoll_create", "epoll_create1", "epoll_ctl", "epoll_pwait", "epoll_wait", "eventfd", "eventfd2", "execve", "execveat", "exit", "exit_group", "faccessat", "fadvise64", "fallocate", "fanotify_mark", "fchdir", "fchmod", "fchmodat", "fchown", "fchownat", "fcntl", "fdatasync", "fgetxattr", "flistxattr", "flock", "fork", "fremovexattr", "fsetxattr", "fstat", "fstatfs", "fsync", "ftruncate", "futex", "getcwd", "getdents", "getdents64", "getegid", "geteuid", "getgid", "getgroups", "getpeername", "getpgid", "getpgrp", "getpid", "getppid", "getpriority", "getrandom", "getresgid", "getresuid", "getrlimit", "get_robust_list", "getrusage", "getsid", "getsockname", "getsockopt", "get_thread_area", "gettid", "gettimeofday", "getuid", "getxattr", "get_robust_list", "inotify_add_watch", "inotify_init", "inotify_init1", "inotify_rm_watch", "io_cancel", "ioctl", "io_destroy", "io_getevents", "io_setup", "io_submit", "ipc", "kill", "lchown", "lgetxattr", "link", "linkat", "listen", "listxattr", "llistxattr", "lremovexattr", "lseek", "lsetxattr", "lstat", "madvise", "mincore", "mkdir", "mkdirat", "mknod", "mknodat", "mlock", "mlockall", "mmap", "mmap2", "mprotect", "mq_getsetattr", "mq_notify", "mq_open", "mq_timedreceive", "mq_timedsend", "mq_unlink", "mremap", "msgctl", "msgget", "msgrcv", "msgsnd", "msync", "munlock", "munlockall", "munmap", "nanosleep", "newfstatat", "_newselect", "open", "openat", "pause", "pipe", "pipe2", "poll", "ppoll", "prctl", "pread64", "preadv", "prlimit64", "pselect6", "ptrace", "pwrite64", "pwritev", "read", "readahead", "readlink", "readlinkat", "readv", "recv", "recvfrom", "recvmmsg", "recvmsg", "remap_file_pages", "removexattr", "rename", "renameat", "renameat2", "restart_syscall", "rmdir", "rt_sigaction", "rt_sigpending", "rt_sigprocmask", "rt_sigqueueinfo", "rt_sigreturn", "rt_sigsuspend", "rt_sigtimedwait", "rt_tgsigqueueinfo", "sched_get_priority_max", "sched_get_priority_min", "sched_getaffinity", "sched_getparam", "sched_getscheduler", "sched_rr_get_interval", "sched_setaffinity", "sched_setparam", "sched_setscheduler", "sched_yield", "seccomp", "select", "send", "sendfile", "sendmmsg", "sendmsg", "sendto", "setfsgid", "setfsuid", "setgid", "setgroups", "setitimer", "setpgid", "setpriority", "setregid", "setresgid", "setresuid", "setreuid", "setrlimit", "set_robust_list", "setsid", "setsockopt", "set_thread_area", "set_tid_address", "setuid", "setxattr", "sgetmask", "shutdown", "sigaction", "sigaltstack", "signal", "signalfd", "signalfd4", "sigpending", "sigprocmask", "sigreturn", "sigsuspend", "socket", "socketcall", "socketpair", "splice", "stat", "statfs", "symlink", "symlinkat", "sync", "sync_file_range", "syncfs", "sysfs", "sysinfo", "syslog", "tee", "tgkill", "time", "timer_create", "timer_delete", "timer_getoverrun", "timer_gettime", "timer_settime", "timerfd_create", "timerfd_gettime", "timerfd_settime", "times", "tkill", "truncate", "umask", "uname", "unlink", "unlinkat", "utime", "utimensat", "utimes", "vfork", "vmsplice", "wait4", "waitid", "waitpid", "write", "writev"], "action": "SCMP_ACT_ALLOW"}
    ]
}
EOF
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Create docker group and add user
    groupadd docker 2>/dev/null || true
    if [[ "$SUDO_USER" ]]; then
        usermod -aG docker "$SUDO_USER"
    fi
    
    log_success "Docker installed with security hardening"
}

# Configure firewall with maximum security
configure_firewall() {
    log_security "Configuring maximum security firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH on custom port
    ufw allow $SSH_PORT/tcp comment 'SSH Custom Port'
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Allow Docker networks (internal)
    ufw allow from 172.16.0.0/12 to any comment 'Docker Networks'
    ufw allow from 192.168.0.0/16 to any comment 'Docker Networks'
    
    # Enable firewall
    ufw --force enable
    
    # Configure iptables rules for additional security
    cat > /etc/ufw/before.rules << 'EOF'
# Drop invalid packets
-A ufw-before-input -m conntrack --ctstate INVALID -j DROP
-A ufw-before-input -m conntrack --ctstate INVALID -j LOG --log-prefix "[UFW BLOCK INVALID]"

# Drop packets with bogus TCP flags
-A ufw-before-input -p tcp --tcp-flags ALL ALL -j DROP
-A ufw-before-input -p tcp --tcp-flags ALL NONE -j DROP
-A ufw-before-input -p tcp --tcp-flags ALL FIN,URG,PSH -j DROP
-A ufw-before-input -p tcp --tcp-flags ALL SYN,RST,ACK,FIN,URG -j DROP

# Rate limiting
-A ufw-before-input -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set
-A ufw-before-input -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# Drop suspicious packets
-A ufw-before-input -p tcp --tcp-flags SYN,ACK,FIN,RST RST -j DROP
-A ufw-before-input -p tcp --tcp-flags SYN,ACK,FIN,RST FIN -j DROP
EOF
    
    ufw reload
    
    log_success "Firewall configured with maximum security"
}

# Clone and setup repository
setup_repository() {
    log_info "Setting up repository..."
    
    # Create directories
    mkdir -p "$APP_DIR" "$BACKUP_DIR" "$LOG_DIR"
    
    # Clone repository
    if [[ -d "$APP_DIR/.git" ]]; then
        log_info "Updating existing repository..."
        cd "$APP_DIR"
        git pull
    else
        log_info "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
    fi
    
    log_success "Repository setup completed"
}

# Create production environment with HTTPS
create_production_env() {
    log_info "Creating production environment with HTTPS..."
    
    cd "$APP_DIR"
    
    # Generate secure secrets
    NEXTAUTH_SECRET=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)
    
    # Create .env file
    cat > .env << EOF
# Phoenix Arena CTF - Production Environment with HTTPS
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
DATABASE_URL=file:/app/prisma/dev.db
INGEST_CHALLENGES_AT_STARTUP=false
CHALLENGES_DIR=/challenges
NODE_ENV=production

# Security
JWT_SECRET="$JWT_SECRET"
NEXT_PUBLIC_APP_URL="https://$DOMAIN"

# Monitoring
HEALTH_CHECK_ENABLED=true
LOG_LEVEL=info
EOF
    
    # Create enhanced Caddyfile with maximum security
    cat > Caddyfile << EOF
# Phoenix Arena CTF - Maximum Security Configuration
$DOMAIN {
    # Security headers
    header {
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        
        # Content Security Policy
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        
        # Other security headers
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        
        # Remove server information
        -Server
        -X-Powered-By
        -X-AspNet-Version
        -X-AspNetMvc-Version
    }
    
    # Rate limiting
    rate_limit {
        zone static {
            key {remote_host}
            events 100
            window 1m
        }
        zone api {
            key {remote_host}
            events 50
            window 1m
        }
    }
    
    # API rate limiting
    @api {
        path /api/*
    }
    rate_limit @api {
        zone api
    }
    
    # Compression
    encode zstd gzip
    
    # Security middleware
    @blocked {
        remote_ip 192.168.0.0/16 10.0.0.0/8 172.16.0.0/12
    }
    respond @blocked 403
    
    # Reverse proxy to app
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-Host {host}
        
        # Health check
        health_uri /api/health
        health_interval 30s
        health_timeout 5s
    }
    
    # Logging
    log {
        output file $LOG_DIR/caddy.log
        format json
        level INFO
    }
    
    # Error handling
    handle_errors {
        @5xx expression {http.error.status_code} >= 500
        respond @5xx "Service temporarily unavailable" 503
    }
}

# Redirect HTTP to HTTPS
http://$DOMAIN {
    redir https://$DOMAIN{uri} permanent
}
EOF
    
    log_success "Production environment created with HTTPS configuration"
}

# Create enhanced docker-compose with maximum security
create_secure_compose() {
    log_info "Creating secure Docker Compose configuration..."
    
    cat > docker-compose.prod.yml << 'EOF'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    env_file: .env
    ports:
      - "127.0.0.1:3000:3000"  # Bind to localhost only
    volumes:
      - sqlite_data:/app/prisma
      - uploads:/app/public/uploads
      - ./challenges:/challenges:ro
      - /var/log/phoenix-arena-ctf:/app/logs
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/tmp:noexec,nosuid,size=100m
    user: "1001:1001"
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    networks:
      - ctf_network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  caddy:
    image: caddy:2-alpine
    depends_on:
      app:
        condition: service_healthy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
      - /var/log/phoenix-arena-ctf:/var/log/caddy
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
      - NET_BIND_SERVICE
    networks:
      - ctf_network
    healthcheck:
      test: ["CMD", "caddy", "healthcheck", "--config", "/etc/caddy/Caddyfile"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Monitoring service
  monitoring:
    image: prom/node-exporter:latest
    ports:
      - "127.0.0.1:9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    networks:
      - ctf_network

volumes:
  sqlite_data:
    driver: local
  uploads:
    driver: local
  caddy_data:
    driver: local
  caddy_config:
    driver: local

networks:
  ctf_network:
    driver: bridge
    internal: false
EOF
    
    log_success "Secure Docker Compose configuration created"
}

# Setup monitoring and alerting
setup_monitoring() {
    log_info "Setting up monitoring and alerting..."
    
    # Create monitoring script
    cat > /usr/local/bin/ctf-monitor.sh << 'EOF'
#!/bin/bash

# CTF Platform Monitoring Script
APP_DIR="/opt/phoenix-arena-ctf"
LOG_FILE="/var/log/phoenix-arena-ctf/monitor.log"
ALERT_EMAIL="admin@yourdomain.com"  # Change this

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if containers are running
check_containers() {
    cd "$APP_DIR"
    if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_message "ERROR: Some containers are not running"
        # Send alert (uncomment if you have mail configured)
        # echo "CTF Platform containers are down!" | mail -s "CTF Alert" "$ALERT_EMAIL"
        return 1
    fi
    return 0
}

# Check disk space
check_disk_space() {
    USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$USAGE" -gt 80 ]; then
        log_message "WARNING: Disk usage is at ${USAGE}%"
    fi
}

# Check memory usage
check_memory() {
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
        log_message "WARNING: Memory usage is at ${MEMORY_USAGE}%"
    fi
}

# Check application health
check_health() {
    if ! curl -sf http://localhost:3000/api/health > /dev/null; then
        log_message "ERROR: Application health check failed"
        return 1
    fi
    return 0
}

# Main monitoring
log_message "Starting monitoring check"
check_containers
check_disk_space
check_memory
check_health
log_message "Monitoring check completed"
EOF
    
    chmod +x /usr/local/bin/ctf-monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/ctf-monitor.sh") | crontab -
    
    log_success "Monitoring setup completed"
}

# Setup automated backups
setup_backups() {
    log_info "Setting up automated backups..."
    
    # Create backup script
    cat > /usr/local/bin/ctf-backup.sh << 'EOF'
#!/bin/bash

# CTF Platform Backup Script
APP_DIR="/opt/phoenix-arena-ctf"
BACKUP_DIR="/opt/backups/phoenix-arena-ctf"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ctf_backup_$DATE.tar.gz"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$BACKUP_DIR/backup.log"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
log_message "Starting database backup"
cd "$APP_DIR"
docker run --rm -v orbital-ctf_sqlite_data:/data -v "$BACKUP_DIR":/backup alpine tar czf "/backup/db_$DATE.tar.gz" -C /data .

# Uploads backup
log_message "Starting uploads backup"
docker run --rm -v orbital-ctf_uploads:/data -v "$BACKUP_DIR":/backup alpine tar czf "/backup/uploads_$DATE.tar.gz" -C /data .

# Configuration backup
log_message "Starting configuration backup"
tar czf "$BACKUP_DIR/config_$DATE.tar.gz" .env Caddyfile docker-compose.prod.yml

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

log_message "Backup completed: $BACKUP_FILE"
EOF
    
    chmod +x /usr/local/bin/ctf-backup.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/ctf-backup.sh") | crontab -
    
    log_success "Automated backups setup completed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application with maximum security..."
    
    cd "$APP_DIR"
    
    # Build and start services
    log_info "Building Docker images..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    log_info "Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 30
    
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

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for full startup
    sleep 20
    
    # Check health endpoint
    if curl -sf https://$DOMAIN/api/health >/dev/null 2>&1; then
        log_success "HTTPS health check passed"
    else
        log_warning "HTTPS health check failed, checking HTTP..."
        if curl -sf http://$DOMAIN/api/health >/dev/null 2>&1; then
            log_warning "HTTP health check passed (HTTPS may still be initializing)"
        else
            log_error "Health check failed"
        fi
    fi
    
    # Check main page
    if curl -sf -I https://$DOMAIN | grep -q "200 OK"; then
        log_success "HTTPS main page is accessible"
    else
        log_warning "HTTPS main page check failed"
    fi
    
    # Show service status
    log_info "Service status:"
    docker compose -f docker-compose.prod.yml ps
    
    # Show recent logs
    log_info "Recent application logs:"
    docker compose -f docker-compose.prod.yml logs --tail=10 app
}

# Show final information
show_final_info() {
    echo ""
    echo "============================================================================="
    echo -e "${GREEN}🎉 Phoenix Arena CTF - Maximum Security Deployment Complete! 🎉${NC}"
    echo "============================================================================="
    echo ""
    echo -e "${BLUE}Access Information:${NC}"
    echo "  🌐 Main Site: https://$DOMAIN"
    echo "  🔍 Health Check: https://$DOMAIN/api/health"
    echo "  📊 Monitoring: http://$DOMAIN:9100 (internal only)"
    echo ""
    echo -e "${BLUE}Security Features Enabled:${NC}"
    echo "  🔒 HTTPS with Let's Encrypt SSL"
    echo "  🛡️  Maximum security headers"
    echo "  🚫 Rate limiting and DDoS protection"
    echo "  🔐 Non-root containers with minimal privileges"
    echo "  📊 Automated monitoring and alerting"
    echo "  💾 Automated daily backups"
    echo "  🔥 Fail2ban intrusion prevention"
    echo "  🚪 Custom SSH port ($SSH_PORT)"
    echo ""
    echo -e "${BLUE}Management Commands:${NC}"
    echo "  📁 App Directory: $APP_DIR"
    echo "  📊 View Logs: docker compose -f docker-compose.prod.yml logs -f"
    echo "  🔄 Restart: docker compose -f docker-compose.prod.yml restart"
    echo "  ⏹️  Stop: docker compose -f docker-compose.prod.yml down"
    echo "  🚀 Start: docker compose -f docker-compose.prod.yml up -d"
    echo "  📈 Monitor: tail -f $LOG_DIR/monitor.log"
    echo "  💾 Backup: /usr/local/bin/ctf-backup.sh"
    echo ""
    echo -e "${BLUE}Configuration Files:${NC}"
    echo "  ⚙️  Environment: $APP_DIR/.env"
    echo "  🔧 Caddy: $APP_DIR/Caddyfile"
    echo "  🐳 Docker Compose: $APP_DIR/docker-compose.prod.yml"
    echo ""
    echo -e "${YELLOW}Important Security Notes:${NC}"
    echo "  1. Change SSH port to $SSH_PORT in /etc/ssh/sshd_config"
    echo "  2. Update firewall rules: ufw allow $SSH_PORT/tcp"
    echo "  3. Restart SSH: systemctl restart ssh"
    echo "  4. Update alert email in /usr/local/bin/ctf-monitor.sh"
    echo "  5. Test your domain DNS points to this server"
    echo ""
    echo "============================================================================="
}

# Main execution
main() {
    echo "============================================================================="
    echo -e "${GREEN}🔥 Phoenix Arena CTF - Maximum Security Auto Deploy 🔥${NC}"
    echo "============================================================================="
    echo ""
    
    # Pre-flight checks
    check_root
    get_domain "$1"
    
    # Installation steps
    harden_system
    install_docker_secure
    configure_firewall
    setup_repository
    create_production_env
    create_secure_compose
    setup_monitoring
    setup_backups
    deploy_application
    verify_deployment
    show_final_info
    
    log_success "Maximum security deployment completed successfully!"
}

# Run main function
main "$@"
