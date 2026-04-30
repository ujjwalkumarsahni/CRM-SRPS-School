import React, { useState, useEffect } from 'react';
import teacherService from '../../services/teacherService';
import Toast from '../../components/Common/Toast';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    if (activeTab === 'view') {
      fetchMyLeaves();
    }
  }, [activeTab]);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getMyLeaves();
      setLeaves(data.data || []);
    } catch (error) {
      setToast({ message: 'Failed to fetch leaves', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teacherService.createLeaveRequest(formData);
      setToast({ message: 'Leave request submitted successfully!', type: 'success' });
      setFormData({ startDate: '', endDate: '', reason: '' });
      setActiveTab('view');
      fetchMyLeaves();
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Failed to submit leave request', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'create', label: 'Create Leave' },
    { id: 'view', label: 'View My Leaves' },
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

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Leave Form */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Apply for Leave</h2>
            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows="4"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field"
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </form>
          </div>

          {/* Guidelines Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Leave Guidelines</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                Submit leave requests at least 3 days in advance
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                Emergency leaves will be considered on a case-by-case basis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                You will receive an email confirmation once your leave is processed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                Approved leaves will automatically lock attendance for those dates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                Maximum 5 consecutive leaves without special approval
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="card">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Start Date</th>
                    <th className="text-left py-3 px-4">End Date</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Reason</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return (
                      <tr key={leave._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{start.toLocaleDateString()}</td>
                        <td className="py-3 px-4">{end.toLocaleDateString()}</td>
                        <td className="py-3 px-4">{duration} day(s)</td>
                        <td className="py-3 px-4">{leave.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{leave.remarks || '-'}</td>
                       </tr>
                    );
                  })}
                </tbody>
               </table>
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LeaveManagement;