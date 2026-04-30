// TeacherMonthlyAttendance.jsx (For Teacher Side)
import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import Toast from '../../components/Common/Toast';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';

const TeacherMonthlyAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, halfDay: 0, leave: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getMyMonthlyAttendance(selectedMonth, selectedYear);
      setAttendances(data.data?.attendances || []);
      setStats(data.data?.stats || { present: 0, absent: 0, halfDay: 0, leave: 0 });
    } catch (error) {
      setToast({ message: 'Failed to fetch attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getAttendanceForDate = (day) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return attendances.find(a => new Date(a.date).toDateString() === date.toDateString());
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half-day': return 'bg-orange-100 text-orange-800';
      case 'leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle size={14} />;
      case 'absent': return <XCircle size={14} />;
      case 'half-day': return <Clock size={14} />;
      case 'leave': return <Lock size={14} />;
      default: return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0D5166]">My Attendance</h1>
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
          >
            {[2023, 2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={fetchAttendance}
            className="px-4 py-2 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f] transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          <div className="text-sm text-gray-500">Present</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-sm text-gray-500">Absent</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.halfDay}</div>
          <div className="text-sm text-gray-500">Half Day</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.leave}</div>
          <div className="text-sm text-gray-500">Leave</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#0D5166] text-white p-4 text-center">
          <h2 className="text-xl font-semibold">{months[selectedMonth - 1]} {selectedYear}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 bg-gray-100 border-b">
              {weekdays.map((day) => (
                <div key={day} className="py-3 text-center font-semibold text-gray-600 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-[100px] border-r border-b bg-gray-50 p-2"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const attendance = getAttendanceForDate(day);
                const isSunday = new Date(selectedYear, selectedMonth - 1, day).getDay() === 0;
                
                let bgColor = 'bg-white';
                if (isSunday) bgColor = 'bg-gray-100';
                else if (attendance?.status === 'present') bgColor = 'bg-green-50';
                else if (attendance?.status === 'absent') bgColor = 'bg-red-50';
                else if (attendance?.status === 'half-day') bgColor = 'bg-orange-50';
                else if (attendance?.status === 'leave') bgColor = 'bg-blue-50';

                return (
                  <div key={day} className={`min-h-[100px] border-r border-b p-2 ${bgColor}`}>
                    <div className={`text-sm font-medium ${isSunday ? 'text-red-500' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    {attendance && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(attendance.status)}`}>
                          {getStatusIcon(attendance.status)}
                          {attendance.status}
                        </span>
                        {attendance.inTime?.time && (
                          <p className="text-xs text-gray-500 mt-1">
                            In: {new Date(attendance.inTime.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeacherMonthlyAttendance;