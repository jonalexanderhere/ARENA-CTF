# 🔥 PHOENIX ARENA CTF - Complete Setup Guide

## 🚀 Quick Start (One-Click Setup)

### Option 1: PowerShell Script (Recommended)
```powershell
.\start-phoenix-arena.ps1
```

### Option 2: Batch File
```cmd
start-phoenix-arena.bat
```

### Option 3: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate reset --force

# 3. Start development server
npm run dev

# 4. Start ngrok (in another terminal)
ngrok http 3000
```

## 🔥 What the Script Does

### ✅ Automatic Setup:
1. **Environment Setup** - Creates `.env` file with Phoenix Arena settings
2. **Database Setup** - Resets and seeds database with Phoenix Arena config
3. **Admin Accounts** - Creates 5 Phoenix Arena admin accounts
4. **Dependencies** - Installs all required packages
5. **Server Start** - Starts Next.js development server
6. **Tunnel Setup** - Creates ngrok tunnel for public access

### 👑 Admin Accounts Created:
| Username | Password | Role |
|----------|----------|------|
| `phoenix1` | `phoenix123` | Admin |
| `phoenix2` | `phoenix123` | Admin |
| `phoenix3` | `phoenix123` | Admin |
| `phoenix4` | `phoenix123` | Admin |
| `phoenix5` | `phoenix123` | Admin |

## 🌐 Access URLs

### Local Access:
- **Main App**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **ngrok Dashboard**: http://localhost:4040

### Public Access:
- **Public URL**: Check ngrok dashboard at http://localhost:4040
- **Tunnel Status**: Active ngrok tunnel for external access

## 🔧 Configuration Changes

### Site Branding Updated:
- **Site Title**: "PHOENIX ARENA CTF"
- **Homepage**: "Welcome to PHOENIX ARENA CTF"
- **Subtitle**: "Rise from the ashes! Epic cyber battles in the PHOENIX ARENA"
- **Rules**: Updated with Phoenix Arena theme and arena-specific rules

### Database Configuration:
- **Theme**: Phoenix Arena (fire/rebirth theme)
- **Admin Accounts**: 5 Phoenix-themed admin accounts
- **Site Config**: All configurations updated to Phoenix Arena branding

## 🛠️ Management Commands

### Start Services:
```bash
# PowerShell (Windows)
.\start-phoenix-arena.ps1

# Batch (Windows)
start-phoenix-arena.bat

# Manual
npm run dev
ngrok http 3000
```

### Stop Services:
- Close the command windows
- Or press `Ctrl+C` in each terminal

### Database Management:
```bash
# View database
npx prisma studio

# Reset database
npx prisma migrate reset --force

# Generate client
npx prisma generate
```

## 🎯 Features Available

### 🔥 Phoenix Arena CTF Features:
- **Arena Theme**: Fire/rebirth themed UI
- **Admin Panel**: Full administrative control
- **Team Management**: Create and manage teams
- **Challenge System**: Multi-flag challenges
- **Real-time Scoring**: Live leaderboards
- **Public Access**: ngrok tunnel for external access

### 🛡️ Security Features:
- **Authentication**: Secure admin login system
- **Session Management**: NextAuth.js integration
- **Password Hashing**: bcrypt encryption
- **Admin Controls**: Full platform management

## 🚨 Troubleshooting

### Common Issues:

1. **Port 3000 in use**:
   ```bash
   # Kill process using port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Database errors**:
   ```bash
   npx prisma generate
   npx prisma migrate reset --force
   ```

3. **ngrok not working**:
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```

4. **Dependencies issues**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🔥 Phoenix Arena CTF - Ready to Rise!

The platform is now fully configured with Phoenix Arena branding and ready for epic cyber battles! 

**Rise from the ashes and conquer the arena! 🔥**
