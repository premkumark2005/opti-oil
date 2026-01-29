# Troubleshooting Guide - Opti-Oil

## Common Network Errors

### Issue: "Network error" repeatedly showing

**Possible Causes:**
1. Backend server not running
2. Backend running on wrong port
3. Frontend trying to connect before backend is ready
4. CORS issues

**Solutions:**

#### 1. Verify Backend is Running
```powershell
# Check if backend is running on port 5000
netstat -ano | findstr :5000

# If not running, start it
cd backend
npm run dev
```

Expected output: `Server running in development mode on port 5000`

#### 2. Verify Frontend is Running
```powershell
# Check if frontend is running on port 3000
netstat -ano | findstr :3000

# If not running, start it
cd frontend
npm run dev
```

Expected output: `Local: http://localhost:3000/`

#### 3. Test Backend API Directly
Open browser and visit: `http://localhost:5000/api`

Should see: `{ "success": true, "message": "Server is running" }`

If you get CORS error in browser console, the backend is running but CORS needs configuration.

#### 4. Clear Browser Cache & Storage
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### 5. Restart Both Servers
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Start backend first
cd backend
npm run dev

# Wait 5 seconds, then start frontend in new terminal
cd frontend  
npm run dev
```

---

## MongoDB Connection Issues

### Issue: "MongoDB connection failed"

**Solutions:**

1. **Check if MongoDB is running**
```powershell
# For Windows with MongoDB installed as service
Get-Service MongoDB

# If not running
Start-Service MongoDB
```

2. **Update connection string in .env**
```env
# For local MongoDB
MONGO_URI=mongodb://localhost:27017/edible-oil-inventory

# For MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/edible-oil-inventory
```

---

## Login Issues

### Issue: "Invalid credentials" even with correct password

**Solution:**
```powershell
# Delete and recreate admin user
cd backend

# Delete existing admin
mongosh edible-oil-inventory --eval "db.users.deleteOne({email: 'admin@optioil.com'})"

# Create new admin
node scripts/seedAdmin.js
```

Login with:
- Email: `admin@optioil.com`
- Password: `Admin@123`

---

## Port Already in Use

### Issue: "Port 5000 is already in use"

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force

# Or kill all node processes
Get-Process node | Stop-Process -Force
```

---

## CORS Errors

### Issue: "CORS policy blocked the request"

**Check backend CORS configuration:**

File: `backend/app.js`
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? true  // Allow all origins in development
    : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: true
};
```

Make sure `CLIENT_URL` in `.env` matches your frontend URL:
```env
CLIENT_URL=http://localhost:3000
```

---

## Notifications Not Showing

### Issue: Notification badge shows 0 or notifications page is empty

**Solution:**
```powershell
# Create test notifications
cd backend
node scripts/createTestNotifications.js
```

Refresh the page and check the notification icon.

---

## Build/Start Issues

### Issue: "Cannot find module" errors

**Solution:**
```powershell
# Backend
cd backend
rm -r node_modules
rm package-lock.json
npm install

# Frontend
cd frontend
rm -r node_modules
rm package-lock.json
npm install
```

---

## API Timeout Errors

### Issue: Requests timing out

**Check timeout settings in frontend:**

File: `frontend/src/services/api.js`
```javascript
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds
});
```

Increase if needed for slow operations:
```javascript
timeout: 30000, // 30 seconds
```

---

## Quick Health Check Script

Create a file `healthcheck.ps1`:
```powershell
Write-Host "=== Opti-Oil Health Check ===" -ForegroundColor Cyan

# Check MongoDB
Write-Host "`nChecking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB is not running" -ForegroundColor Red
}

# Check Backend
Write-Host "`nChecking Backend (port 5000)..." -ForegroundColor Yellow
$backend = netstat -ano | findstr :5000
if ($backend) {
    Write-Host "✓ Backend is running on port 5000" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api" -UseBasicParsing
        Write-Host "✓ Backend API is responding" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backend is running but not responding" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Backend is not running" -ForegroundColor Red
}

# Check Frontend
Write-Host "`nChecking Frontend (port 3000)..." -ForegroundColor Yellow
$frontend = netstat -ano | findstr :3000
if ($frontend) {
    Write-Host "✓ Frontend is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend is not running" -ForegroundColor Red
}

Write-Host "`n=== Health Check Complete ===" -ForegroundColor Cyan
```

Run with: `.\healthcheck.ps1`

---

## Still Having Issues?

1. Check browser console (F12) for detailed error messages
2. Check backend terminal for error logs
3. Ensure MongoDB is running
4. Try accessing `http://localhost:5000/api` directly in browser
5. Clear browser cache and localStorage
6. Restart both servers in correct order (backend first, then frontend)

---

## Contact & Support

For persistent issues, check:
- PROJECT_STATUS.md - Overall project status
- START_HERE.md - Setup instructions
- README.md - Project documentation
