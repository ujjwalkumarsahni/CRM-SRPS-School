import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const PendingVerificationTab = ({ 
  teachers, loading, onViewDetails, onVerify, onReject, onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const pendingTeachers = teachers.filter(t => !t.isVerified && t.profileCompleted);

  const filteredTeachers = pendingTeachers.filter(teacher => {
    return teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const handleRejectClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (await onReject(selectedTeacher._id, rejectReason)) {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTeacher(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 bg-linear-to-r from-[#0D5166] to-[#1a6f8a] text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Pending Verification Requests</h3>
            <p className="text-sm text-orange-100">Teachers waiting for account verification</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="font-bold text-xl">{pendingTeachers.length}</span>
            <span className="text-sm ml-1">Pending</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border-b border-[#EADDCD] bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or designation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
            />
          </div>
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f] transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">S.No</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Designation</th>
              <th className="text-left py-3 px-4">Profile</th>
              <th className="text-left py-3 px-4">Submitted On</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div>
                  </div>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={48} className="text-green-500" />
                    <p>No pending verification requests</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((teacher, index) => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">{indexOfFirstItem + index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{teacher.name}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.designation}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onViewDetails(teacher)}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      <Eye size={14} /> View Profile
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(teacher.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVerify(teacher._id)}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
                      >
                        <CheckCircle size={14} /> Verify
                      </button>
                      <button
                        onClick={() => handleRejectClick(teacher)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 text-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#EADDCD] flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#0D5166] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Reject Teacher Application</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject <strong>{selectedTeacher.name}</strong>'s application?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingVerificationTab;