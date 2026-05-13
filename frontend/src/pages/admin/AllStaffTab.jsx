// AllStaffTab.jsx
import React, { useState } from 'react';
import { 
  Eye, CheckCircle, XCircle, Clock, Search, 
  Filter, ChevronLeft, ChevronRight, RefreshCw,
  UserX, UserCheck
} from 'lucide-react';

const AllStaffTab = ({ 
  teachers, loading, pagination, filters, onPageChange, onFilterChange,
  onViewDetails, onVerify, onReject, onDeactivate, onActivate, onRefresh 
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    status: filters.status || 'all'
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, search: value }));
  };

  const handleSearchSubmit = () => {
    onFilterChange({ search: localFilters.search });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, status: value }));
    onFilterChange({ status: value });
  };

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

  const handlePageClick = (newPage) => {
    onPageChange(newPage);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Filters Bar */}
      <div className="p-4 border-b border-[#EADDCD] bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={localFilters.search}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={localFilters.status}
              onChange={handleStatusFilterChange}
              className="w-full md:w-[200px] pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleSearchSubmit}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f]"
            >
              <Search size={16} />
              Search
            </button>
            <button
              onClick={onRefresh}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
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
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((teacher, index) => {
                const status = getStatusBadge(teacher);
                const StatusIcon = status.icon;
                return (
                  <tr key={teacher._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                    </td>
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
                              onClick={() => onReject(teacher._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        {teacher.isVerified && teacher.isActive && (
                          <button
                            onClick={() => onDeactivate(teacher._id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Deactivate"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                        
                        {!teacher.isActive && teacher.status !== 'rejected' && (
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
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#EADDCD] flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageClick(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      pagination.currentPage === pageNum
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
              onClick={() => handlePageClick(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllStaffTab;