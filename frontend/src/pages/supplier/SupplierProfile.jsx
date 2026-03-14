import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import supplierAuthService from '../../services/supplierAuthService';

const SupplierProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await supplierAuthService.getProfile();
      const user = response.data.supplier;
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.businessName || '',
        address: user.address || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await supplierAuthService.updateProfile(profileData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await supplierAuthService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={profileData.companyName}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Address *</label>
              <textarea
                name="address"
                value={profileData.address}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Current Password *</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">New Password *</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Confirm New Password *</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
