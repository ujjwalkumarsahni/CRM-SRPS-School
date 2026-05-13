// StaffManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Users, Clock, UserPlus, RefreshCw } from 'lucide-react';
import adminService from '../../services/adminService.js';
import Toast from '../../components/Common/Toast.jsx';
import Swal from 'sweetalert2';
import AllStaffTab from './AllStaffTab';
import PendingVerificationTab from './PendingVerificationTab';
import CreateStaffTab from './CreateStaffTab';
import TeacherDetailsModal from './TeacherDetailsModal';

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5
  });
  const [filters, setFilters] = useState({
    status: 'all',
    isVerified: '',
    isActive: '',
    designation: '',
    search: '',
    profileCompleted: ''
  });

  const fetchTeachers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...filters
      };
      
      const data = await adminService.getAllTeachers(params);
      setTeachers(data.data || []);
      setPagination(data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: pagination.itemsPerPage
      });
      
      // Fetch pending count separately or calculate from API
      const pendingParams = { status: 'pending', limit: 1 };
      const pendingData = await adminService.getAllTeachers(pendingParams);
      setPendingCount(pendingData.pagination?.totalItems || 0);
    } catch (error) {
      setToast({ message: 'Failed to fetch teachers', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.itemsPerPage]);

  useEffect(() => {
    fetchTeachers(1);
  }, [fetchTeachers]);

  const handlePageChange = (newPage) => {
    fetchTeachers(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    fetchTeachers(1);
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      timer: 3000,
      showConfirmButton: true,
      confirmButtonColor: '#0D5166'
    });
  };

  const showConfirmAlert = async (title, text, confirmButtonText, confirmButtonColor) => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    return result.isConfirmed;
  };

  const handleVerifyTeacher = async (teacherId) => {
    const confirmed = await showConfirmAlert(
      'Verify Teacher?',
      'This teacher will be able to access the system after verification.',
      'Yes, Verify',
      '#10b981'
    );
    
    if (!confirmed) return;

    try {
      await adminService.verifyTeacher(teacherId);
      showSuccessAlert('Teacher verified successfully!');
      fetchTeachers(pagination.currentPage);
    } catch (error) {
      showErrorAlert(error.response?.data?.error || 'Failed to verify teacher');
    }
  };

  const handleRejectTeacher = async (teacherId, reason) => {
    const { value: rejectionReason } = await Swal.fire({
      title: 'Reject Teacher Application',
      text: 'Please provide a reason for rejection:',
      input: 'textarea',
      inputPlaceholder: 'Enter rejection reason...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Rejection reason is required!';
        }
      }
    });

    if (!rejectionReason) return;

    try {
      await adminService.rejectTeacher(teacherId, rejectionReason);
      showSuccessAlert('Teacher application rejected successfully');
      fetchTeachers(pagination.currentPage);
      return true;
    } catch (error) {
      showErrorAlert(error.response?.data?.error || 'Failed to reject teacher');
      return false;
    }
  };

  const handleDeactivateTeacher = async (teacherId, reason) => {
    const { value: deactivationReason } = await Swal.fire({
      title: 'Deactivate Teacher Account',
      text: 'Please provide a reason for deactivation:',
      input: 'textarea',
      inputPlaceholder: 'Enter deactivation reason...',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Deactivate',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Deactivation reason is required!';
        }
      }
    });

    if (!deactivationReason) return;

    try {
      await adminService.deactivateTeacher(teacherId, deactivationReason);
      showSuccessAlert('Teacher account deactivated successfully');
      fetchTeachers(pagination.currentPage);
      return true;
    } catch (error) {
      showErrorAlert(error.response?.data?.error || 'Failed to deactivate teacher');
      return false;
    }
  };

  const handleActivateTeacher = async (teacherId) => {
    const confirmed = await showConfirmAlert(
      'Activate Teacher Account?',
      'This teacher will regain access to the system.',
      'Yes, Activate',
      '#10b981'
    );
    
    if (!confirmed) return;

    try {
      await adminService.activateTeacher(teacherId);
      showSuccessAlert('Teacher account activated successfully');
      fetchTeachers(pagination.currentPage);
    } catch (error) {
      showErrorAlert(error.response?.data?.error || 'Failed to activate teacher');
    }
  };

  const tabs = [
    { id: 'view', label: 'All Staff', icon: Users, count: pagination.totalItems },
    { id: 'pending', label: 'Pending Verification', icon: Clock, count: pendingCount },
    { id: 'create', label: 'Create Staff', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0D5166]">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all teachers and staff members</p>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-[#EADDCD]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-[#0D5166] text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'view' && (
          <AllStaffTab
            teachers={teachers}
            loading={loading}
            pagination={pagination}
            filters={filters}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            onViewDetails={handleViewDetails}
            onVerify={handleVerifyTeacher}
            onReject={handleRejectTeacher}
            onDeactivate={handleDeactivateTeacher}
            onActivate={handleActivateTeacher}
            onRefresh={() => fetchTeachers(pagination.currentPage)}
          />
        )}

        {activeTab === 'pending' && (
          <PendingVerificationTab
            teachers={teachers}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onViewDetails={handleViewDetails}
            onVerify={handleVerifyTeacher}
            onReject={handleRejectTeacher}
            onRefresh={() => fetchTeachers(pagination.currentPage)}
          />
        )}

        {activeTab === 'create' && (
          <CreateStaffTab
            loading={loading}
            onSuccess={() => {
              fetchTeachers(1);
              setActiveTab('view');
            }}
            setToast={setToast}
          />
        )}

        {/* Teacher Details Modal */}
        {showDetailsModal && selectedTeacher && (
          <TeacherDetailsModal
            teacher={selectedTeacher}
            onClose={() => setShowDetailsModal(false)}
            onVerify={handleVerifyTeacher}
            onReject={handleRejectTeacher}
            onDeactivate={handleDeactivateTeacher}
            onActivate={handleActivateTeacher}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default StaffManagement;