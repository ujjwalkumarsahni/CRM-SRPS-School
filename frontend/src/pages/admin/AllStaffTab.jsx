import React, { useState } from 'react';
import { 
  Eye, CheckCircle, XCircle, Clock, Search, 
  Filter, ChevronLeft, ChevronRight, RefreshCw,
  UserX, UserCheck
} from 'lucide-react';

const AllStaffTab = ({ 
  teachers, loading, onViewDetails, onVerify, 
  onReject, onDeactivate, onActivate, onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const getStatusBadge = (teacher) => {
    if (!teacher.isActive) {
      return { text: 'Inactive', color: 'bg-red-100 text-red-800', icon: UserX };
    } else if (teacher.isVerified) {
      return { text: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (teacher.profileCompleted) {
      return { text: 'Pending Verification', color: 'bg-orange-100 text-orange-800', icon: Clock };
    } else {
      return { text: 'Incomplete', color: 'bg-gray-100 text-gray-800', icon: XCircle };
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'verified') {
      matchesStatus = teacher.isVerified === true && teacher.isActive === true;
    } else if (statusFilter === 'pending') {
      matchesStatus = !teacher.isVerified && teacher.profileCompleted;
    } else if (statusFilter === 'incomplete') {
      matchesStatus = !teacher.profileCompleted;
    } else if (statusFilter === 'active') {
      matchesStatus = teacher.isActive === true;
    } else if (statusFilter === 'inactive') {
      matchesStatus = teacher.isActive === false;
    }
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const handleRejectClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowRejectModal(true);
  };

  const handleDeactivateClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeactivateModal(true);
  };

  const handleConfirmReject = async () => {
    if (await onReject(selectedTeacher._id, rejectReason)) {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTeacher(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (await onDeactivate(selectedTeacher._id, deactivateReason)) {
      setShowDeactivateModal(false);
      setDeactivateReason('');
      setSelectedTeacher(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Filters Bar */}
      <div className="p-4 border-b border-[#EADDCD] bg-gray-50">
  <div className="flex flex-col md:flex-row md:items-center gap-3">

    {/* 🔹 Search */}
    <div className="w-full md:flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
      />
    </div>

    {/* 🔹 Status Filter */}
    <div className="w-full md:w-auto relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full md:w-[180px] pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] bg-white"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="deactivated">Deactivated</option>
      </select>
    </div>

    {/* 🔹 Buttons */}
    <div className="flex gap-2 w-full md:w-auto">
      <button
        onClick={onRefresh}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f]"
      >
        <RefreshCw size={16} />
        Refresh
      </button>
    </div>

  </div>
</div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0D5166] text-white">
            <tr>
              <th className="text-left py-3 px-4">S.No</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Designation</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Joining Date</th>
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
                  No teachers found
                </td>
              </tr>
            ) : (
              currentItems.map((teacher, index) => {
                const status = getStatusBadge(teacher);
                const StatusIcon = status.icon;
                return (
                  <tr key={teacher._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{teacher.name}</td>
                    <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                    <td className="py-3 px-4 text-gray-600">{teacher.designation}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(teacher.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onViewDetails(teacher)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {!teacher.isVerified && teacher.profileCompleted && (
                          <>
                            <button
                              onClick={() => onVerify(teacher._id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verify"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectClick(teacher)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        {teacher.isVerified && teacher.isActive && (
                          <button
                            onClick={() => handleDeactivateClick(teacher)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Deactivate"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                        
                        {!teacher.isActive && (
                          <button
                            onClick={() => onActivate(teacher._id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Deactivate Modal */}
      {showDeactivateModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Deactivate Teacher Account</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to deactivate <strong>{selectedTeacher.name}</strong>'s account?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Deactivation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Please provide a reason for deactivation..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDeactivate}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setDeactivateReason('');
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

export default AllStaffTab;