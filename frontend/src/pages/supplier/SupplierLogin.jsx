import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import supplierAuthService from '../../services/supplierAuthService';

const SupplierLogin = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await supplierAuthService.login(formData);
      setUserData(response.data.supplier, response.data.token);
      toast.success('Login successful!');
      navigate('/supplier/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // Show specific error messages with appropriate styling
      if (errorMessage.includes('pending')) {
        toast.warning('⏳ Your account is pending admin approval. Please wait for approval.', {
          autoClose: 5000
        });
      } else if (errorMessage.includes('rejected')) {
        toast.error('❌ Your account has been rejected. Please contact support.', {
          autoClose: 5000
        });
      } else if (errorMessage.includes('deactivated')) {
        toast.error('🚫 Your account has been deactivated. Please contact support.', {
          autoClose: 5000
        });
      } else if (errorMessage.includes('Invalid credentials')) {
        toast.error('🔒 Invalid email or password. Please try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Supplier Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your supplier dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/supplier/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>

          <div className="text-center text-sm">
            <Link to="/" className="font-medium text-gray-600 hover:text-gray-500">
              ← Back to Home
            </Link>
            <span className="mx-2 text-gray-400">|</span>
            <Link to="/login" className="font-medium text-gray-600 hover:text-gray-500">
              Admin/Wholesaler Login →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierLogin;
