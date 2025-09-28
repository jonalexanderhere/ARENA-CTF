@echo off
title PHOENIX ARENA CTF - Startup Script
color 0C

echo.
echo ================================================
echo    PHOENIX ARENA CTF - Starting All Services
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [INFO] Node.js detected
echo [INFO] Installing dependencies...

REM Install dependencies
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [INFO] Setting up environment...

REM Create .env file if it doesn't exist
if not exist .env (
    echo DATABASE_URL="file:./prisma/dev.db" > .env
    echo NEXTAUTH_SECRET="phoenix-arena-secret-2024" >> .env
    echo NEXTAUTH_URL="http://localhost:3000" >> .env
    echo INGEST_CHALLENGES_AT_STARTUP=true >> .env
    echo CHALLENGES_DIR="./challenges" >> .env
    echo [INFO] .env file created
)

REM Create challenges directory
if not exist challenges mkdir challenges

echo [INFO] Setting up database...

REM Generate Prisma client
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

REM Reset and seed database
call npx prisma migrate reset --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to reset database
    pause
    exit /b 1
)

echo [INFO] Creating admin accounts...

REM Create admin accounts script
echo const { PrismaClient } = require('./prisma/generated/client'); > create-admins.js
echo const bcrypt = require('bcryptjs'); >> create-admins.js
echo require('dotenv').config(); >> create-admins.js
echo. >> create-admins.js
echo const prisma = new PrismaClient(); >> create-admins.js
echo. >> create-admins.js
echo async function createAdminAccounts() { >> create-admins.js
echo   const adminAccounts = [ >> create-admins.js
echo     { alias: 'phoenix1', name: 'Phoenix Admin 1', password: 'phoenix123' }, >> create-admins.js
echo     { alias: 'phoenix2', name: 'Phoenix Admin 2', password: 'phoenix123' }, >> create-admins.js
echo     { alias: 'phoenix3', name: 'Phoenix Admin 3', password: 'phoenix123' }, >> create-admins.js
echo     { alias: 'phoenix4', name: 'Phoenix Admin 4', password: 'phoenix123' }, >> create-admins.js
echo     { alias: 'phoenix5', name: 'Phoenix Admin 5', password: 'phoenix123' } >> create-admins.js
echo   ]; >> create-admins.js
echo. >> create-admins.js
echo   for (const admin of adminAccounts) { >> create-admins.js
echo     try { >> create-admins.js
echo       const hashedPassword = await bcrypt.hash(admin.password, 10); >> create-admins.js
echo       await prisma.user.create({ >> create-admins.js
echo         data: { >> create-admins.js
echo           alias: admin.alias, >> create-admins.js
echo           name: admin.name, >> create-admins.js
echo           password: hashedPassword, >> create-admins.js
echo           isAdmin: true, >> create-admins.js
echo           isTeamLeader: false >> create-admins.js
echo         } >> create-admins.js
echo       }); >> create-admins.js
echo       console.log(`Created: ${admin.alias}`); >> create-admins.js
echo     } catch (error) { >> create-admins.js
echo       if (error.code === 'P2002') { >> create-admins.js
echo         console.log(`${admin.alias} already exists`); >> create-admins.js
echo       } >> create-admins.js
echo     } >> create-admins.js
echo   } >> create-admins.js
echo } >> create-admins.js
echo. >> create-admins.js
echo createAdminAccounts().finally(() => prisma.$disconnect()); >> create-admins.js

call node create-admins.js
del create-admins.js

echo [INFO] Starting PHOENIX ARENA CTF server...

REM Start Next.js development server
start "PHOENIX ARENA CTF Server" cmd /k "npm run dev"

REM Wait a moment for server to start
timeout /t 10 /nobreak >nul

echo [INFO] Starting ngrok tunnel...

REM Install ngrok if not available
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing ngrok...
    call npm install -g ngrok
)

REM Start ngrok tunnel
start "ngrok Tunnel" cmd /k "ngrok http 3000"

REM Wait for ngrok to start
timeout /t 5 /nobreak >nul

echo.
echo ================================================
echo    PHOENIX ARENA CTF - ALL SYSTEMS ONLINE!
echo ================================================
echo.
echo [SUCCESS] Services started successfully!
echo.
echo Access URLs:
echo   Local:  http://localhost:3000
echo   Public: Check ngrok dashboard at http://localhost:4040
echo.
echo Admin Accounts:
echo   Username: phoenix1, phoenix2, phoenix3, phoenix4, phoenix5
echo   Password: phoenix123 (for all accounts)
echo.
echo Management:
echo   Prisma Studio: http://localhost:5555
echo   ngrok Dashboard: http://localhost:4040
echo.
echo Press any key to open the application...
pause >nul

REM Open the application
start http://localhost:3000

echo.
echo [INFO] PHOENIX ARENA CTF is now running!
echo [INFO] Close the command windows to stop services.
echo.
pause
