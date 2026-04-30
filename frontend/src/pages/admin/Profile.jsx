import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Common/Toast';
import { 
  User, Mail, Briefcase, Calendar, Phone, 
  MapPin, CheckCircle, XCircle, Edit2, Save, X, Camera,
  Lock, Key, Eye, EyeOff, Shield
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    designation: '',
    phone: '',
    address: '',
  });
  const [editFiles, setEditFiles] = useState({
    photo: null,
  });
  const [fileNames, setFileNames] = useState({
    photo: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await adminService.getAdminProfile();
      setProfile(data.data.user);
      setAdminProfile(data.data.adminProfile);
      setEditForm({
        name: data.data.user?.name || '',
        email: data.data.user?.email || '',
        designation: data.data.user?.designation || 'Administrator',
        phone: data.data.adminProfile?.phone || '',
        address: data.data.adminProfile?.address || '',
      });
    } catch (error) {
      setToast({ message: 'Failed to fetch profile', type: 'error' });
      setProfile(user);
      setEditForm({
        name: user?.name || '',
        email: user?.email || '',
        designation: user?.designation || 'Administrator',
        phone: '',
        address: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFiles({ ...editFiles, photo: file });
      setFileNames({ ...fileNames, photo: file.name });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const submitData = new FormData();
    Object.keys(editForm).forEach(key => {
      if (editForm[key]) {
        submitData.append(key, editForm[key]);
      }
    });
    if (editFiles.photo) {
      submitData.append('photo', editFiles.photo);
    }

    try {
      const response = await adminService.updateAdminProfile(submitData);
      setProfile(response.data.user);
      setAdminProfile(response.data.adminProfile);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setEditing(false);
      setEditFiles({ photo: null });
      setFileNames({ photo: '' });
      
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Failed to update profile', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    
    setEditLoading(true);
    try {
      await adminService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Failed to change password', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D5166]"></div>
      </div>
    );
  }

  const profileData = profile;
  const adminProfileData = adminProfile;

  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-[#EADDCD] rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                {editFiles.photo ? (
                  <img 
                    src={URL.createObjectURL(editFiles.photo)} 
                    alt="Profile Preview" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : adminProfileData?.photo?.url ? (
                  <img 
                    src={adminProfileData.photo.url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[#0D5166] text-3xl font-bold">
                    {profileData?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 bg-[#F5C78B] p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-[#e8b86e] transition-colors">
                  <Camera size={14} className="text-[#0D5166]" />
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profileData?.name}</h2>
              <p className="text-[#F5C78B] mt-1 capitalize">{profileData?.role}</p>
              <p className="text-white/80 text-sm mt-1">{profileData?.designation || 'Administrator'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons inside Card */}
        {!editing && (
          <div className="px-6 pt-4 flex justify-end gap-3 border-b border-[#EADDCD] pb-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f] transition-colors"
            >
              <Lock size={16} /> Change Password
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5C78B] text-[#0D5166] rounded-lg hover:bg-[#e8b86e] transition-colors"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        )}

        {!editing ? (
          // View Mode
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#0D5166] mb-4 pb-2 border-b border-[#EADDCD]">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="text-[#0D5166] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">{profileData?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-[#0D5166] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-800">{profileData?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="text-[#0D5166] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-medium text-gray-800">{profileData?.designation || 'Administrator'}</p>
                </div>
              </div>

              {adminProfileData?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">{adminProfileData.phone}</p>
                  </div>
                </div>
              )}

              {adminProfileData?.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-800">{adminProfileData.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="text-[#0D5166] mt-1">
                  {profileData?.isVerified ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <XCircle size={20} className="text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className={`font-medium ${profileData?.isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                    {profileData?.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-[#0D5166] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-800">
                    {new Date(profileData?.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[#0D5166] mb-4 pb-2 border-b border-[#EADDCD]">
              Edit Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={editForm.designation}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                  placeholder="e.g., Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#EADDCD]">
              <button
                type="submit"
                disabled={editLoading}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditFiles({ photo: null });
                  setFileNames({ photo: '' });
                  fetchProfile();
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white hover:text-[#F5C78B] transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166]"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166]"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-[#EADDCD]/30 rounded-lg p-3">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Shield size={12} /> Password must be at least 6 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminProfile;