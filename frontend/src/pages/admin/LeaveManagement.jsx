import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';
import Toast from '../../components/Common/Toast.jsx';
import { CheckCircle, XCircle } from 'lucide-react';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllLeaveRequests();
      setLeaves(data.data || []);
    } catch (error) {
      setToast({ message: 'Failed to fetch leaves', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessLeave = async (leaveId, status) => {
    try {
      await adminService.processLeaveRequest(leaveId, { status, remarks });
      setToast({ message: `Leave ${status} successfully`, type: 'success' });
      setRemarks('');
      fetchLeaves();
    } catch (error) {
      setToast({ message: 'Failed to process leave', type: 'error' });
    }
  };

  const tabs = [
    { id: 'view', label: 'View Leaves' },
    { id: 'verify', label: 'Verify Leaves' },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Leave Management</h1>
      
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Teacher</th>
                  <th className="text-left py-3 px-4">Start Date</th>
                  <th className="text-left py-3 px-4">End Date</th>
                  <th className="text-left py-3 px-4">Reason</th>
                  <th className="text-left py-3 px-4">Status</th>
                  {activeTab === 'verify' && <th className="text-left py-3 px-4">Action</th>}
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'view' ? leaves : leaves.filter(l => l.status === 'pending')).map((leave) => (
                  <tr key={leave._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{leave.teacher?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{leave.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    {activeTab === 'verify' && leave.status === 'pending' && (
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <textarea
                            placeholder="Remarks (optional)"
                            className="text-sm border rounded px-2 py-1"
                            rows="1"
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                          <button
                            onClick={() => handleProcessLeave(leave._id, 'approved')}
                            className="btn-success px-3 py-1 text-sm flex items-center gap-1"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleProcessLeave(leave._id, 'rejected')}
                            className="btn-danger px-3 py-1 text-sm flex items-center gap-1"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LeaveManagement;