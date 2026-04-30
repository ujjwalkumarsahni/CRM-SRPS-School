import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import Toast from '../../components/Common/Toast';
import { assets } from '../../assets/assets';
import { 
  Calendar, Droplet, Phone, GraduationCap, MapPin, 
  User, CreditCard, FileText, Image, Upload, 
  Camera, CheckCircle, AlertCircle 
} from 'lucide-react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    dob: '',
    bloodGroup: '',
    mobileNumber: '',
    address: '',
    highestQualification: '',
  });
  const [files, setFiles] = useState({
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [e.target.name]: file });
      setFileNames({ ...fileNames, [e.target.name]: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });

    try {
      await teacherService.completeProfile(submitData);
      setToast({ 
        message: 'Profile submitted successfully! Waiting for admin verification.', 
        type: 'success' 
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Failed to submit profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D5166]/5 to-[#F5C78B]/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
                <img 
                  src={assets.logo} 
                  alt="School Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
            <p className="text-[#F5C78B] text-sm">Please provide your details to complete registration</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EADDCD]">
                <User className="text-[#0D5166]" size={20} />
                <h3 className="text-lg font-semibold text-[#0D5166]">Personal Information</h3>
              </div>
              
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
                      required
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
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
                      required
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent appearance-none"
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
                      required
                      pattern="[0-9]{10}"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
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
                      required
                      value={formData.highestQualification}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                      placeholder="M.Sc Mathematics"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EADDCD]">
                <MapPin className="text-[#0D5166]" size={20} />
                <h3 className="text-lg font-semibold text-[#0D5166]">Address Information</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address
                </label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent resize-none"
                  placeholder="Enter your full address with city, state, and pincode"
                />
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EADDCD]">
                <FileText className="text-[#0D5166]" size={20} />
                <h3 className="text-lg font-semibold text-[#0D5166]">Documents & Photos</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Camera size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {fileNames.photo || "Choose profile photo"}
                        </span>
                      </div>
                      <Upload size={16} className="text-gray-400" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
                </div>

                {/* Aadhar Card */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Aadhar Card
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="aadharCard"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="aadhar-upload"
                    />
                    <label
                      htmlFor="aadhar-upload"
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {fileNames.aadharCard || "Upload Aadhar Card"}
                        </span>
                      </div>
                      <Upload size={16} className="text-gray-400" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                </div>

                {/* PAN Card */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN Card
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="panCard"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pan-upload"
                    />
                    <label
                      htmlFor="pan-upload"
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {fileNames.panCard || "Upload PAN Card"}
                        </span>
                      </div>
                      <Upload size={16} className="text-gray-400" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                </div>

                {/* Qualification Certificate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualification Certificate
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="qualificationCertificate"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label
                      htmlFor="certificate-upload"
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-[#0D5166] transition-colors bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {fileNames.qualificationCertificate || "Upload Certificate"}
                        </span>
                      </div>
                      <Upload size={16} className="text-gray-400" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#EADDCD]/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-[#0D5166] flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-[#0D5166] font-medium">Important Notes:</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• All documents will be verified by the admin</li>
                  <li>• Make sure all information is accurate</li>
                  <li>• You will receive an email confirmation after submission</li>
                  <li>• Account will be activated after admin verification</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#0D5166] text-white py-3 rounded-lg font-semibold hover:bg-[#0a3d4f] transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Submit Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CompleteProfile;