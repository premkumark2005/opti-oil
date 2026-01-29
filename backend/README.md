# Edible Oil Inventory & Wholesale System - Backend

## Overview
This is the backend API for the Edible Oil Inventory & Wholesale System, a B2B MERN stack application for managing edible oil inventory and wholesale operations.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator
- **Security:** Helmet, CORS, rate-limiting, XSS protection

## Project Structure
```
backend/
├── config/           # Configuration files (DB, constants)
├── models/           # Mongoose models
├── controllers/      # Route controllers
├── routes/           # API routes
├── middleware/       # Custom middleware (auth, error handling)
├── utils/            # Utility functions and helpers
├── app.js            # Express app setup
├── server.js         # Server entry point
├── .env              # Environment variables
└── package.json      # Dependencies
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and update the values
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |
| `LOW_STOCK_THRESHOLD` | Inventory alert threshold | 100 |

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products (Coming Soon)
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

## Security Features
- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- CORS protection
- XSS protection
- NoSQL injection prevention
- Input validation and sanitization

## Error Handling
- Centralized error handling middleware
- Custom AppError class for operational errors
- Validation error formatting
- Mongoose error handling
- JWT error handling

## Development
- Use `npm run dev` for development with auto-reload
- Follow ES6+ module syntax
- Implement proper error handling with try-catch
- Use async/await for asynchronous operations
- Validate all inputs using express-validator

## License
ISC
