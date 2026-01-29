# Quick Start Guide

Get Opti-Oil up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- MongoDB running (local or Atlas)
- Git installed

## Installation

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Install backend dependencies:**
```bash
cd backend
npm install
cp .env.example .env
```

2. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

## Configuration

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/opti-oil
JWT_SECRET=your-secret-key-here
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Initialize Database

Seed admin user:
```bash
cd backend
npm run seed:admin
```

**Admin Credentials:**
- Email: `admin@opti-oil.com`
- Password: `admin123`

## Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

## First Steps

1. **Login as Admin:**
   - Go to http://localhost:5173
   - Login with admin credentials
   - Change password in Profile settings

2. **Create Products:**
   - Navigate to Products
   - Add products with images
   - Set inventory levels

3. **Register Wholesaler:**
   - Logout
   - Click "Register"
   - Create wholesaler account
   - Login as admin to approve

4. **Place Test Order:**
   - Login as wholesaler
   - Browse products
   - Add to cart
   - Place order
   - Login as admin to approve

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB is running
```bash
# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (Linux/Mac)
sudo systemctl start mongod
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Change port in `backend/.env`
```env
PORT=5001
```

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Check `CLIENT_URL` in `backend/.env` matches frontend URL

### Module Not Found
```
Error: Cannot find module
```
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- 📖 Read the full [README.md](README.md)
- 🤝 Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- 🔒 Review [SECURITY.md](SECURITY.md) for production deployment
- 📝 See [CHANGELOG.md](CHANGELOG.md) for latest updates

## Support

- 📧 Email: support@opti-oil.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/opti-oil/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/opti-oil/discussions)

---

**Enjoy using Opti-Oil! 🎉**
