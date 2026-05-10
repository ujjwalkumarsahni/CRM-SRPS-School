import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';
import Swal from 'sweetalert2';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  User,
  Mail,
  AlertCircle
} from 'lucide-react';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leaves, searchTerm, filterStatus, activeTab]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllLeaveRequests();
      setLeaves(data.data || []);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.error || 'Failed to fetch leaves',
        icon: 'error',
        confirmButtonColor: '#0D5166'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaves];

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(l => l.status === 'pending');
    }

    // Filter by status (for all tab)
    if (activeTab === 'all' && filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaves(filtered);
  };

  const handleProcessLeave = async (leaveId, status) => {
    const result = await Swal.fire({
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Leave Request?`,
      html: `
        <div class="text-left">
          <label class="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
          <textarea id="remarks" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent" rows="3" placeholder="Add any remarks..."></textarea>
        </div>
      `,
      icon: status === 'approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'approved' ? '#10B981' : '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: status === 'approved' ? 'Yes, Approve' : 'Yes, Reject',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const remarks = document.getElementById('remarks').value;
        return { remarks };
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await adminService.processLeaveRequest(leaveId, { 
          status, 
          remarks: result.value.remarks 
        });
        
        Swal.fire({
          title: 'Success!',
          text: `Leave request ${status} successfully`,
          icon: 'success',
          confirmButtonColor: '#0D5166',
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchLeaves();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.error || 'Failed to process leave',
          icon: 'error',
          confirmButtonColor: '#0D5166'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const viewLeaveDetails = (leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    Swal.fire({
      title: 'Leave Request Details',
      html: `
        <div style="text-align: left;">
          <div class="mb-4 p-4" style="background: #EADDCD; border-radius: 12px;">
            <div class="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D5166" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="font-semibold" style="color: #0D5166;">${leave.teacher?.name || 'N/A'}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D5166" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span class="text-sm" style="color: #4B5563;">${leave.teacher?.email || 'N/A'}</span>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center pb-2" style="border-bottom: 1px solid #E5E7EB;">
              <span style="color: #6B7280;">Start Date:</span>
              <span class="font-semibold" style="color: #1F2937;">${start.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="flex justify-between items-center pb-2" style="border-bottom: 1px solid #E5E7EB;">
              <span style="color: #6B7280;">End Date:</span>
              <span class="font-semibold" style="color: #1F2937;">${end.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="flex justify-between items-center pb-2" style="border-bottom: 1px solid #E5E7EB;">
              <span style="color: #6B7280;">Duration:</span>
              <span class="font-semibold" style="color: #1F2937;">${duration} day${duration > 1 ? 's' : ''}</span>
            </div>
            <div class="pb-2" style="border-bottom: 1px solid #E5E7EB;">
              <span style="color: #6B7280;">Reason:</span>
              <p class="mt-1" style="color: #1F2937;">${leave.reason}</p>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span style="color: #6B7280;">Submitted:</span>
              <span style="color: #6B7280; font-size: 13px;">${new Date(leave.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#0D5166',
      confirmButtonText: 'Close',
      width: '500px'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock size={14} className="text-yellow-600" />,
        label: 'Pending'
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle size={14} className="text-green-600" />,
        label: 'Approved'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle size={14} className="text-red-600" />,
        label: 'Rejected'
      }
    };
    return badges[status] || badges.pending;
  };

  const getStatistics = () => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    return { total, pending, approved, rejected };
  };

  const stats = getStatistics();

  const tabs = [
    { id: 'pending', label: 'Pending Requests', icon: Clock, count: stats.pending },
    { id: 'all', label: 'All Requests', icon: Calendar, count: stats.total }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D5166]">Leave Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage teacher leave requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-[#0D5166]">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-[#EADDCD] rounded-full flex items-center justify-center">
              <Calendar size={20} className="text-[#0D5166]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[#EADDCD]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-6 py-2 rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#0D5166] text-white shadow-lg"
                  : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white text-[#0D5166]' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EADDCD] mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by teacher name, email or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
              />
            </div>
            
            {activeTab === 'all' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
          
          {(searchTerm || (activeTab === 'all' && filterStatus !== 'all')) && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <XCircle size={14} /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leave Requests Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#0D5166] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading leave requests...</p>
          </div>
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EADDCD] p-8 text-center">
          <div className="w-16 h-16 bg-[#EADDCD] rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar size={28} className="text-[#0D5166]" />
          </div>
          <h3 className="text-base font-medium text-[#0D5166] mb-1">No leave requests found</h3>
          <p className="text-sm text-gray-500">
            {activeTab === 'pending' ? 'No pending leave requests to review' : 'No leave requests match your filters'}
          </p>
          {(searchTerm || (activeTab === 'all' && filterStatus !== 'all')) && (
            <button
              onClick={clearFilters}
              className="mt-4 text-[#0D5166] text-sm hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#EADDCD] overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0D5166]">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">Teacher</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">Leave Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">Reason</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">Submitted</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-[#EADDCD]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeaves.map((leave) => {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                const statusBadge = getStatusBadge(leave.status);
                
                return (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{leave.teacher?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{leave.teacher?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{duration} day{duration > 1 ? 's' : ''}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={leave.reason}>
                        {leave.reason.length > 50 ? leave.reason.substring(0, 50) + '...' : leave.reason}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(leave.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewLeaveDetails(leave)}
                          className="p-1.5 text-[#0D5166] hover:bg-[#EADDCD] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleProcessLeave(leave._id, 'approved')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleProcessLeave(leave._id, 'rejected')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        {leave.status !== 'pending' && leave.remarks && (
                          <div className="relative group">
                            <AlertCircle size={16} className="text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Remarks: {leave.remarks}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;