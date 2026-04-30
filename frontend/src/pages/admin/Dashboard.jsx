import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import adminService from '../../services/adminService.js';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    pendingVerification: 0,
    pendingLeaves: 0,
    todayPresent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const teachersData = await adminService.getAllTeachers();
      const leavesData = await adminService.getAllLeaveRequests();
      
      const teachers = teachersData.data || [];
      const leaves = leavesData.data || [];
      
      setStats({
        totalTeachers: teachers.length,
        pendingVerification: teachers.filter(t => !t.isVerified && t.profileCompleted).length,
        pendingLeaves: leaves.filter(l => l.status === 'pending').length,
        todayPresent: teachers.filter(t => t.todayAttendance === 'present').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'bg-indigo-500' },
    { title: 'Pending Verification', value: stats.pendingVerification, icon: Clock, color: 'bg-orange-500' },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: FileText, color: 'bg-yellow-500' },
    { title: 'Today Present', value: stats.todayPresent, icon: CheckCircle, color: 'bg-green-500' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;