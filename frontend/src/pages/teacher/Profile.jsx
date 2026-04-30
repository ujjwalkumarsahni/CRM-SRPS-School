import React, { useState, useEffect } from 'react';
import teacherService from '../../services/teacherService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Common/Toast';
import { 
  User, Mail, Briefcase, Calendar, Droplet, Phone, 
  MapPin, GraduationCap, CheckCircle, XCircle, 
  FileText, Clock, Lock, Edit2, Save, X, Camera,
  Upload, CreditCard
} from 'lucide-react';

const TeacherProfile = () => {
  const { user, setProfile: setAuthProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    dob: '',
    bloodGroup: '',
    mobileNumber: '',
    address: '',
    highestQualification: '',
  });
  const [editFiles, setEditFiles] = useState({
    photo: null,
    aadharCard: null,
    panCard: null,
    qualificationCertificate: null,
  });
  const [fileNames, setFileNames] = useState({
    photo: '',
    aadharCard: '',
    panCard: '',
    qualificationCertificate: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await teacherService.getMyProfile();
      setProfile(data.data);
      
      // Populate edit form with current data
      if (data.data?.profile) {
        setEditForm({
          dob: data.data.profile.dob ? data.data.profile.dob.split('T')[0] : '',
          bloodGroup: data.data.profile.bloodGroup || '',
          mobileNumber: data.data.profile.mobileNumber || '',
          address: data.data.profile.address || '',
          highestQualification: data.data.profile.highestQualification || '',
        });
      }
    } catch (error) {
      setToast({ message: 'Failed to fetch profile', type: 'error' });
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
      setEditFiles({ ...editFiles, [e.target.name]: file });
      setFileNames({ ...fileNames, [e.target.name]: file.name });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const submitData = new FormData();
    Object.keys(editForm).forEach(key => {
      submitData.append(key, editForm[key]);
    });
    Object.keys(editFiles).forEach(key => {
      if (editFiles[key]) {
        submitData.append(key, editFiles[key]);
      }
    });

    try {
      const response = await teacherService.updateProfile(submitData);
      setProfile(response.data);
      
      // Update auth context if photo was updated
      if (response.data?.profile?.photo?.url) {
        setAuthProfile?.(response.data.profile);
      }
      
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setEditing(false);
      setEditFiles({ photo: null, aadharCard: null, panCard: null, qualificationCertificate: null });
      setFileNames({ photo: '', aadharCard: '', panCard: '', qualificationCertificate: '' });
      
      // Refresh profile data
      fetchProfile();
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Failed to update profile', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (teacherData?.isVerified) {
      return { text: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (teacherData?.profileCompleted) {
      return { text: 'Pending Verification', color: 'bg-orange-100 text-orange-800', icon: Clock };
    } else {
      return { text: 'Incomplete', color: 'bg-gray-100 text-gray-800', icon: XCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D5166]"></div>
      </div>
    );
  }

  const teacherData = profile?.user;
  const teacherProfile = profile?.profile;
  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header with Edit Button */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 bg-[#EADDCD] rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                {teacherProfile?.photo?.url ? (
                  <img 
                    src={teacherProfile.photo.url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[#0D5166] text-4xl font-bold">
                    {teacherData?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 bg-[#0D5166] p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-[#0a3d4f] transition-colors">
                  <Camera size={14} className="text-white" />
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
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h2 className="text-2xl font-bold text-white">{teacherData?.name}</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-[#F5C78B] mt-1">{teacherData?.designation}</p>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <StatusIcon size={16} />
                <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {!editing ? (
          // View Mode
          <>
            {/* Personal Information */}
            <div className="p-6 border-b border-[#EADDCD]">
              <h3 className="text-lg font-semibold text-[#0D5166] mb-4 flex items-center gap-2">
                <User size={20} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">{teacherData?.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">{teacherData?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Designation</p>
                    <p className="font-medium text-gray-800">{teacherData?.designation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-800">
                      {teacherProfile?.dob ? new Date(teacherProfile.dob).toLocaleDateString('en-GB') : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Droplet className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <p className="font-medium text-gray-800">{teacherProfile?.bloodGroup || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-medium text-gray-800">{teacherProfile?.mobileNumber || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-800">{teacherProfile?.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <GraduationCap className="text-[#0D5166] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Highest Qualification</p>
                    <p className="font-medium text-gray-800">{teacherProfile?.highestQualification || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {teacherProfile?.documents && (
              <div className="p-6 border-b border-[#EADDCD]">
                <h3 className="text-lg font-semibold text-[#0D5166] mb-4 flex items-center gap-2">
                  <FileText size={20} /> Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teacherProfile.documents.aadharCard && (
                    <a 
                      href={teacherProfile.documents.aadharCard.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-[#EADDCD]/30 rounded-lg hover:bg-[#EADDCD]/50 transition-colors"
                    >
                      <FileText size={20} className="text-[#0D5166]" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Aadhar Card</p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                    </a>
                  )}

                  {teacherProfile.documents.panCard && (
                    <a 
                      href={teacherProfile.documents.panCard.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-[#EADDCD]/30 rounded-lg hover:bg-[#EADDCD]/50 transition-colors"
                    >
                      <FileText size={20} className="text-[#0D5166]" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">PAN Card</p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                    </a>
                  )}

                  {teacherProfile.documents.qualificationCertificate && (
                    <a 
                      href={teacherProfile.documents.qualificationCertificate.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-[#EADDCD]/30 rounded-lg hover:bg-[#EADDCD]/50 transition-colors"
                    >
                      <FileText size={20} className="text-[#0D5166]" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Qualification Certificate</p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#0D5166] mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Profile Status</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    teacherData?.profileCompleted ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {teacherData?.profileCompleted ? 'Completed' : 'Incomplete'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Verification Status</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    teacherData?.isVerified ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {teacherData?.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(teacherData?.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="text-sm font-medium text-gray-800 capitalize">{teacherData?.role}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Edit Mode Form
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-8">
            {/* Personal Information Edit */}
            <div>
              <h3 className="text-lg font-semibold text-[#0D5166] mb-4 flex items-center gap-2">
                <Edit2 size={20} /> Edit Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      name="dob"
                      value={editForm.dob}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="bloodGroup"
                      value={editForm.bloodGroup}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={editForm.mobileNumber}
                      onChange={handleEditChange}
                      pattern="[0-9]{10}"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Highest Qualification
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="highestQualification"
                      value={editForm.highestQualification}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                      placeholder="M.Sc Mathematics"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Update */}
            <div>
              <h3 className="text-lg font-semibold text-[#0D5166] mb-4 flex items-center gap-2">
                <Upload size={20} /> Update Documents (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Profile Photo
                  </label>
                  <label className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Camera size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {fileNames.photo || "Choose new photo"}
                      </span>
                    </div>
                    <Upload size={16} className="text-gray-400" />
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Aadhar Card
                  </label>
                  <label className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {fileNames.aadharCard || "Upload new Aadhar"}
                      </span>
                    </div>
                    <Upload size={16} className="text-gray-400" />
                    <input
                      type="file"
                      name="aadharCard"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update PAN Card
                  </label>
                  <label className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {fileNames.panCard || "Upload new PAN"}
                      </span>
                    </div>
                    <Upload size={16} className="text-gray-400" />
                    <input
                      type="file"
                      name="panCard"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Qualification Certificate
                  </label>
                  <label className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {fileNames.qualificationCertificate || "Upload new certificate"}
                      </span>
                    </div>
                    <Upload size={16} className="text-gray-400" />
                    <input
                      type="file"
                      name="qualificationCertificate"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave empty if you don't want to update documents</p>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={editLoading}
              className="w-full bg-[#0D5166] text-white py-3 rounded-lg font-semibold hover:bg-[#0a3d4f] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Profile
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeacherProfile;