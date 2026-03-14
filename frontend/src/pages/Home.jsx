import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slideDown">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-2xl">🛢️</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opti-Oil</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20 animate-slideDown">
          <h2 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opti-Oil</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive Oil Distribution Management System for Efficient Operations
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-20">
          {/* Admin & Wholesaler Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 border border-blue-100 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-5xl">👥</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Admin & Wholesaler
              </h3>
              <p className="text-gray-600 text-lg">
                Manage inventory, orders, and distribution
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">Login</span>
              </Link>
              <Link
                to="/register"
                className="block w-full bg-white hover:bg-blue-50 text-blue-600 font-bold py-4 px-6 rounded-xl border-3 border-blue-600 transition-all text-center shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="text-lg">Register</span>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <p className="text-sm text-gray-500 text-center font-medium">
                For administrators and wholesaler partners
              </p>
            </div>
          </div>

          {/* Supplier Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 border border-green-100 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-5xl">🚚</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Supplier Portal
              </h3>
              <p className="text-gray-600 text-lg">
                Manage raw materials and orders
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/supplier/login"
                className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">Supplier Login</span>
              </Link>
              <Link
                to="/supplier/signup"
                className="block w-full bg-white hover:bg-green-50 text-green-600 font-bold py-4 px-6 rounded-xl border-3 border-green-600 transition-all text-center shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="text-lg">Supplier Signup</span>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <p className="text-sm text-gray-500 text-center font-medium">
                For raw material suppliers (Requires admin approval)
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Key Features</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">📦</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Inventory Management
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Real-time tracking of products and raw materials with smart alerts
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">🛒</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Order Processing
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Streamlined order workflow from creation to delivery tracking
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">📊</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Analytics & Reports
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Comprehensive insights and data-driven decision making tools
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 text-lg">
            © 2026 Opti-Oil. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Empowering oil distribution businesses with smart technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
