import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => api.put('/auth/profile', data),
    {
      onSuccess: (response) => {
        updateProfile(response.data.data.user);
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => api.put('/auth/change-password', data),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    }
  );

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Profile & Settings</h1>

      {/* Profile Information */}
      <Card title="Profile Information" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
            <FormInput
              label="Full Name"
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />

            <FormInput
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
              disabled
              helperText="Email cannot be changed"
            />

            <FormInput
              label="Phone Number"
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setProfileData({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || ''
                })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card title="Change Password">
        <form onSubmit={handlePasswordSubmit}>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
            <FormInput
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />

            <FormInput
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Button 
                type="submit" 
                disabled={changePasswordMutation.isLoading}
              >
                {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Account Information */}
      <Card title="Account Information" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <span style={{ fontWeight: '500' }}>Role:</span>
            <span style={{ color: 'var(--primary-color)', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <span style={{ fontWeight: '500' }}>Account Status:</span>
            <span style={{ color: 'var(--success-color)' }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <span style={{ fontWeight: '500' }}>Last Login:</span>
            <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <span style={{ fontWeight: '500' }}>Member Since:</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProfile;
