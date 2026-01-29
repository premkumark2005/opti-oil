# Opti-Oil Frontend

React application for the Edible Oil Inventory & Wholesale System.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Admin Dashboard**: Inventory, orders, products, suppliers, wholesalers, reports
- **Wholesaler Dashboard**: Browse products, place orders, track order status
- **Real-time Notifications**: Order updates, low stock alerts
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- React Query for data fetching
- React Toastify for notifications
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js 16+
- Backend server running on `http://localhost:5000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── context/          # React context (AuthContext)
├── pages/            # Page components
│   ├── admin/       # Admin pages
│   ├── wholesaler/  # Wholesaler pages
│   └── auth/        # Login/Register
├── services/         # API service layer
├── App.jsx          # Main app component
└── main.jsx         # App entry point
```

## API Services

- `authService`: Authentication operations
- `productService`: Product management
- `inventoryService`: Inventory operations
- `orderService`: Order management
- `supplierService`: Supplier operations
- `notificationService`: Notifications
- `reportService`: Reports and analytics
- `wholesalerService`: Wholesaler management
