@echo off
REM Opti-Oil Setup Script for Windows
REM This script automates the initial setup process

echo ==========================================
echo   Opti-Oil Setup Script
echo ==========================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)

echo [OK] Node.js found: 
node -v

REM Check if npm is installed
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed.
    exit /b 1
)

echo [OK] npm found: 
npm -v
echo.

echo ==========================================
echo   Installing Backend Dependencies
echo ==========================================
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env with your configuration
    echo.
)

cd ..

echo ==========================================
echo   Installing Frontend Dependencies
echo ==========================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
    echo.
)

cd ..

echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your MongoDB connection and JWT secret
echo 2. Start MongoDB (if not using Atlas)
echo 3. Seed admin user: cd backend ^&^& npm run seed:admin
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Default admin credentials after seeding:
echo Email: admin@opti-oil.com
echo Password: admin123
echo.
echo Happy coding! 🚀
echo.
pause
