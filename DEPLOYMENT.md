# Deployment Guide

This guide covers deploying Opti-Oil to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
  - [Heroku](#heroku)
  - [Render](#render)
  - [Railway](#railway)
- [Frontend Deployment](#frontend-deployment)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Steps](#post-deployment-steps)

## Prerequisites

- GitHub account
- MongoDB Atlas account (or managed MongoDB service)
- Hosting platform account (Heroku, Render, Vercel, etc.)
- Domain name (optional)

## Backend Deployment

### Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login to Heroku:**
```bash
heroku login
```

3. **Create Heroku App:**
```bash
heroku create opti-oil-backend
```

4. **Set Environment Variables:**
```bash
heroku config:set MONGO_URI="your-mongodb-atlas-uri"
heroku config:set JWT_SECRET="your-production-secret"
heroku config:set NODE_ENV="production"
heroku config:set CLIENT_URL="https://your-frontend-domain.com"
```

5. **Deploy:**
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

6. **Seed Admin User:**
```bash
heroku run npm run seed:admin
```

### Render

1. **Connect GitHub Repository**
2. **Create New Web Service**
3. **Configure:**
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
4. **Add Environment Variables** (same as Heroku)
5. **Deploy**

### Railway

1. **Connect GitHub Repository**
2. **Create New Project**
3. **Add Service from GitHub**
4. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**
6. **Deploy**

## Frontend Deployment

### Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd frontend
vercel
```

4. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-domain.com`

5. **Redeploy:**
```bash
vercel --prod
```

### Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Build Frontend:**
```bash
cd frontend
npm run build
```

4. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

5. **Environment Variables:**
   - Netlify Dashboard → Site Settings → Build & Deploy → Environment
   - Add: `VITE_API_URL=https://your-backend-domain.com`

## Database Setup

### MongoDB Atlas

1. **Create Free Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free tier cluster (M0)

2. **Create Database User:**
   - Database Access → Add New Database User
   - Choose password authentication
   - Note username and password

3. **Configure Network Access:**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0` (for production, restrict to your server IPs)

4. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` and `<dbname>`

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/opti-oil?retryWrites=true&w=majority
```

## Environment Configuration

### Production Environment Variables

**Backend (.env):**
```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/opti-oil

# JWT
JWT_SECRET=super-secure-random-string-min-32-chars
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=production

# Frontend
CLIENT_URL=https://opti-oil.vercel.app

# Optional
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://opti-oil-backend.herokuapp.com
```

### Generating Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Post-Deployment Steps

### 1. Seed Admin User

**Heroku:**
```bash
heroku run npm run seed:admin --app opti-oil-backend
```

**Render/Railway:**
Use the platform's console to run:
```bash
npm run seed:admin
```

### 2. Test Application

- Login with admin credentials
- Create test products
- Register test wholesaler
- Place test order
- Verify WebSocket connections
- Test file uploads
- Generate test reports

### 3. Security Checklist

- [ ] Change default admin password
- [ ] Verify HTTPS is enabled
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Restrict database network access
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review security headers
- [ ] Test API security

### 4. Configure Custom Domain (Optional)

**Vercel:**
```bash
vercel domains add yourdomain.com
```

**Netlify:**
- Site Settings → Domain Management → Add Custom Domain

**Backend (Heroku):**
```bash
heroku domains:add api.yourdomain.com
```

### 5. Set Up SSL Certificate

Most platforms provide free SSL certificates automatically:
- Vercel: Automatic
- Netlify: Automatic
- Heroku: Automatic with ACM
- Render: Automatic

### 6. Monitoring & Logging

**Backend Logging:**
- Use platform's built-in logging
- Consider external services (Logtail, Papertrail)

**Error Tracking:**
- Sentry
- Rollbar
- Bugsnag

**Performance Monitoring:**
- New Relic
- Datadog
- Application Insights

### 7. Backup Strategy

**MongoDB Atlas:**
- Enable Cloud Backup (automatic daily snapshots)
- Configure retention period

**Manual Backups:**
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/opti-oil"
```

## Continuous Deployment

### GitHub Actions (Already Configured)

The project includes CI/CD pipeline in `.github/workflows/ci.yml`:
- Runs tests on push
- Checks for security vulnerabilities
- Builds both backend and frontend

### Auto-Deploy on Push

**Vercel:** Automatically deploys on push to main branch

**Netlify:** Configure in Build & Deploy settings

**Heroku:** 
```bash
heroku git:remote -a opti-oil-backend
git push heroku main
```

## Troubleshooting

### Issue: CORS Error in Production

**Solution:** Update `CLIENT_URL` in backend environment variables

### Issue: Database Connection Timeout

**Solution:** 
- Check MongoDB Atlas network access
- Verify connection string
- Ensure IP whitelist includes hosting platform IPs

### Issue: WebSocket Not Connecting

**Solution:**
- Ensure WebSocket support on hosting platform
- Update CORS configuration for Socket.IO
- Check firewall rules

### Issue: File Upload Fails

**Solution:**
- Use cloud storage (AWS S3, Cloudinary) instead of local storage
- Update multer configuration
- Set proper permissions

## Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Deploy multiple backend instances
- Configure sticky sessions for WebSocket

### Database Scaling
- Upgrade MongoDB Atlas tier
- Enable sharding for large datasets
- Use read replicas

### CDN for Static Assets
- Use Cloudflare
- AWS CloudFront
- Vercel Edge Network

## Cost Optimization

- MongoDB Atlas: Start with M0 (free tier)
- Heroku: Use Eco Dynos ($5/month)
- Vercel/Netlify: Free tier suitable for small projects
- Consider serverless functions for infrequent tasks

---

For additional help, consult platform-specific documentation or open an issue on GitHub.
