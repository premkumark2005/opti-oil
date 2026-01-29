#!/bin/bash

# Opti-Oil Setup Script
# This script automates the initial setup process

echo "=========================================="
echo "  Opti-Oil Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check if MongoDB is running
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB found${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB not found locally. Make sure MongoDB is installed or use MongoDB Atlas.${NC}"
fi

echo ""
echo "=========================================="
echo "  Installing Backend Dependencies"
echo "=========================================="
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating backend .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env with your configuration${NC}"
fi

cd ..

echo ""
echo "=========================================="
echo "  Installing Frontend Dependencies"
echo "=========================================="
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating frontend .env file..."
    cp .env.example .env
fi

cd ..

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your MongoDB connection and JWT secret"
echo "2. Start MongoDB (if not using Atlas)"
echo "3. Seed admin user: cd backend && npm run seed:admin"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
echo "Default admin credentials after seeding:"
echo "Email: admin@opti-oil.com"
echo "Password: admin123"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
