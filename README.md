# Opti-Oil - Edible Oil Inventory & Wholesale Management System

A complete **MERN stack** web application for managing edible oil inventory and wholesale operations. Built with modern web technologies, real-time updates, and production-ready features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)

## 🚀 Features

### 👨‍💼 Admin Features
- **Dashboard**: Real-time statistics with interactive charts (Chart.js)
  - Order status distribution (Doughnut chart)
  - Monthly revenue trends (Line chart)
  - Top products by stock (Bar chart)
- **Product Management**: CRUD operations with image upload
- **Inventory Management**: Stock tracking, low stock alerts, reorder levels
- **Order Management**: Approve/reject orders, status tracking, invoice generation
- **Wholesaler Management**: View and manage wholesaler accounts
- **Reports & Analytics**: 
  - Inventory status reports
  - Low stock alerts
  - Order summaries
  - Product performance
  - Export to PDF/Excel
- **Real-time Notifications**: WebSocket-powered instant updates
- **Profile & Settings**: Account management

### 🏢 Wholesaler Features
- **Dashboard**: Order summary and spending analytics
- **Product Catalog**: Browse products with images and filters
- **Shopping Cart**: Add items and place orders
- **Order Tracking**: Real-time order status updates
- **Invoice Download**: Generate and download order invoices
- **Profile Management**: Update business information
- **Real-time Notifications**: Order approval/rejection alerts

### 🔐 Security Features
- JWT authentication with secure token storage
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- MongoDB injection prevention
- XSS protection with Helmet
- CORS configuration
- Secure HTTP headers

### 📊 Advanced Features
- **Real-time Updates**: Socket.IO WebSocket connections
- **Enhanced Search**: Multi-field search with saved filter presets
- **File Upload**: Product image management with Multer
- **PDF Generation**: Professional invoices and packing slips
- **Excel Export**: Export reports to Excel spreadsheets
- **Responsive Design**: Mobile-friendly UI
- **Toast Notifications**: User-friendly feedback messages

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean
- **Real-time**: Socket.IO
- **Environment**: dotenv

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **PDF Generation**: jsPDF
- **Excel Export**: xlsx
- **Real-time**: socket.io-client
- **Notifications**: react-toastify
- **Styling**: CSS Modules

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** v18.0.0 or higher
- **MongoDB** v5.0 or higher (local or MongoDB Atlas)
- **npm** or **yarn** package manager
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/opti-oil.git
cd opti-oil
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGO_URI=mongodb://localhost:27017/opti-oil
# - JWT_SECRET=your-super-secret-jwt-key
# - JWT_EXPIRE=30d
# - PORT=5000
# - NODE_ENV=development
# - CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000
```

### 4. Seed Admin User (Optional)

```bash
# From backend directory
npm run seed:admin

# Default admin credentials:
# Email: admin@opti-oil.com
# Password: admin123
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
opti-oil/
├── backend/
│   ├── config/           # Configuration files (DB, constants, socket)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware (auth, error, upload)
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── utils/           # Utility functions (notifications, response)
│   ├── app.js           # Express app configuration
│   ├── server.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── hooks/       # Custom hooks (useSocket)
│   │   ├── pages/       # Page components
│   │   │   ├── admin/   # Admin pages
│   │   │   └── wholesaler/  # Wholesaler pages
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions (exports, invoices)
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## 🔑 Default Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@opti-oil.com`
- Password: `admin123`

**⚠️ Important**: Change default credentials in production!

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new wholesaler
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Order Endpoints
- `POST /api/orders` - Place order (Wholesaler)
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my-orders` - Get user orders (Wholesaler)
- `PUT /api/orders/:id/approve` - Approve order (Admin)
- `PUT /api/orders/:id/reject` - Reject order (Admin)

### Inventory Endpoints
- `GET /api/inventory` - Get all inventory
- `PUT /api/inventory/:id/restock` - Restock inventory (Admin)

### Report Endpoints
- `GET /api/reports/inventory-status` - Inventory report
- `GET /api/reports/low-stock` - Low stock report
- `GET /api/reports/orders` - Order summary report

## 🔄 WebSocket Events

### Admin Events
- `new_order` - New order placed by wholesaler
- `low_stock_alert` - Product stock below reorder level
- `inventory_updated` - Inventory changes

### Wholesaler Events
- `order_approved` - Order approved by admin
- `order_rejected` - Order rejected by admin
- `order_status_updated` - Order status changed

## 🧪 Testing

```bash
# Backend tests (if configured)
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment (Heroku/Render)

1. Set environment variables on hosting platform
2. Ensure MongoDB connection string is configured
3. Deploy backend code
4. Run seed script if needed

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Set `VITE_API_URL` to your backend URL
3. Deploy the `dist` folder

### Environment Variables for Production

**Backend:**
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=strong-random-secret
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
PORT=5000
```

**Frontend:**
```
VITE_API_URL=https://your-backend-domain.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Chart.js for beautiful charts
- React community for excellent tools
- MongoDB for scalable database
- Socket.IO for real-time functionality

## 📞 Support

For support, email support@opti-oil.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration
- [ ] Automated inventory forecasting
- [ ] API documentation with Swagger

---

**Built with ❤️ using MERN Stack**
