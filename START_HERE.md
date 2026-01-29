# 🚀 Quick Start Guide - Opti-Oil Application

## Prerequisites

- ✅ Node.js installed (v16+)
- ✅ MongoDB installed and running OR MongoDB Atlas account
- ✅ Terminal/Command Prompt

---

## 📦 First-Time Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux

# Edit .env file with your settings
# Minimum required: MONGODB_URI and JWT_SECRET
```

**Edit `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/opti-oil
JWT_SECRET=change-this-to-a-long-random-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install
```

---

## 🎬 Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**You should see:**
```
  VITE v5.0.8  ready in 500 ms
  ➜  Local:   http://localhost:5173/
```

### Create Admin Account (Terminal 3 - First Time Only)

```bash
cd backend
node scripts/seedAdmin.js
```

**You should see:**
```
🎉 Admin user created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@optioil.com
🔑 Password: Admin@123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🌐 Access the Application

Open your browser and go to:
```
http://localhost:5173
```

---

## 🔐 Login Credentials

### Admin Login
- Email: `admin@optioil.com`
- Password: `Admin@123`
- Dashboard: Full admin access

### Wholesaler Registration
- Click "Register" on login page
- Fill in the form
- Wait for admin approval
- Login after approval

---

## 🧪 Testing the Application

### As Admin:

1. **Login** → `http://localhost:5173/login` → Click "Admin Login"
2. **Create Products** → Dashboard → Products → Add Product
3. **Add Inventory** → Dashboard → Inventory → Stock In
4. **Approve Wholesalers** → Dashboard → Wholesalers (when available)
5. **View Reports** → Dashboard → Reports

### As Wholesaler:

1. **Register** → `http://localhost:5173/register`
2. **Login as Admin** → Approve the wholesaler
3. **Login as Wholesaler** → Browse catalog
4. **Add to Cart** → Select products → Add to Cart
5. **Place Order** → Open cart → Enter shipping address → Place Order
6. **Track Order** → Dashboard → My Orders

---

## 🛑 Troubleshooting

### Backend won't start

**Problem:** "Cannot connect to MongoDB"
```bash
# Solution: Make sure MongoDB is running
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Problem:** "Port 5000 already in use"
```bash
# Solution: Change PORT in .env file
PORT=5001
```

### Frontend won't start

**Problem:** "Port 5173 already in use"
```bash
# Solution: Vite will automatically use next available port
# Just press 'y' when prompted
```

### Cannot login

**Problem:** "Invalid credentials"
```bash
# Solution: Make sure admin account is created
cd backend
node scripts/seedAdmin.js
```

### API errors

**Problem:** "Network Error" or "Cannot connect"
```bash
# Solution: Check if backend is running on port 5000
# Check backend terminal for errors
# Verify MONGODB_URI in .env is correct
```

---

## 📝 Common Tasks

### Reset Admin Password

```bash
cd backend
node scripts/seedAdmin.js
# This will tell you if admin exists
# To reset, delete admin from MongoDB first:
mongosh
use opti-oil
db.users.deleteOne({ email: 'admin@optioil.com' })
exit
# Then run seed script again
node scripts/seedAdmin.js
```

### Clear Database

```bash
mongosh
use opti-oil
db.dropDatabase()
exit
# Then restart backend and run seedAdmin.js
```

### View API Documentation

Backend API endpoints:
- Health Check: `http://localhost:5000/health`
- Auth: `http://localhost:5000/api/auth/*`
- Products: `http://localhost:5000/api/products/*`
- Orders: `http://localhost:5000/api/orders/*`
- More in `backend/routes/` directory

---

## 🎯 Next Steps

1. ✅ Change admin password after first login
2. ✅ Create some products
3. ✅ Add inventory
4. ✅ Register test wholesaler
5. ✅ Approve wholesaler
6. ✅ Place test order
7. ✅ Explore all features!

---

## 📞 Need Help?

- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed status
- Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for code patterns
- Check [SECURITY.md](SECURITY.md) for security features
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for app structure

---

## 🎉 You're All Set!

The application is now running and ready to use. Enjoy exploring Opti-Oil! 🚀
