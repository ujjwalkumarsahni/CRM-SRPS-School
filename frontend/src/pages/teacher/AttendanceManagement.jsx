import React, { useState, useEffect } from 'react';
import { MapPin, Clock, FileText, CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight, Navigation } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import Toast from '../../components/Common/Toast';

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('mark');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, halfDay: 0, leave: 0, presentPercentage: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [workReport, setWorkReport] = useState('');
  const [toast, setToast] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (activeTab === 'mark') {
      fetchTodayAttendance();
    } else {
      fetchMonthlyAttendance();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      setTodayAttendance(data.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getMyMonthlyAttendance(selectedMonth, selectedYear);
      setCalendarData(data.data?.calendarData || []);
      setStats(data.data?.stats || {});
    } catch (error) {
      setToast({ message: 'Failed to fetch attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation is not supported', type: 'error' });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setToast({ message: 'Location captured successfully', type: 'success' });
        setLoading(false);
      },
      (error) => {
        setToast({ message: 'Unable to get location. Please enable GPS.', type: 'error' });
        setLoading(false);
      }
    );
  };

  const handleMarkInTime = async () => {
    if (!location) {
      setToast({ message: 'Please get your location first', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await attendanceService.markInTime({ location, workReport });
      setToast({ message: 'In-time marked successfully', type: 'success' });
      setWorkReport('');
      fetchTodayAttendance();
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Failed to mark in-time', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOutTime = async () => {
    if (!location) {
      setToast({ message: 'Please get your location first', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await attendanceService.markOutTime({ location, workReport });
      setToast({ message: 'Out-time marked successfully', type: 'success' });
      setWorkReport('');
      fetchTodayAttendance();
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Failed to mark out-time', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
      case 'present': return <CheckCircle size={14} className="text-green-600" />;
      case 'absent': return <XCircle size={14} className="text-red-600" />;
      case 'half-day': return <Clock size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0D5166] mb-6">Attendance Management</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[#EADDCD]">
        <button
          onClick={() => setActiveTab('mark')}
          className={`px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
            activeTab === 'mark' ? 'bg-[#0D5166] text-white shadow-lg' : 'text-gray-600 hover:bg-[#EADDCD]'
          }`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
            activeTab === 'view' ? 'bg-[#0D5166] text-white shadow-lg' : 'text-gray-600 hover:bg-[#EADDCD]'
          }`}
        >
          View Attendance
        </button>
      </div>

      {/* Mark Attendance Tab */}
      {activeTab === 'mark' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#0D5166] mb-4">Mark Today's Attendance</h2>
            
            {todayAttendance?.status === 'leave' ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-blue-500 mb-3" />
                <p className="text-gray-600">You are on leave today. No need to mark attendance.</p>
              </div>
            ) : (
              <>
                <button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="w-full bg-[#0D5166] text-white py-3 rounded-lg hover:bg-[#0a3d4f] transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Navigation size={18} /> Get Current Location
                </button>

                {location && (
                  <div className="bg-green-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-green-800">
                      📍 Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                <textarea
                  value={workReport}
                  onChange={(e) => setWorkReport(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] mb-4"
                  rows="3"
                  placeholder="Describe your work for today..."
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleMarkInTime}
                    disabled={loading || todayAttendance?.inTime?.time}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {todayAttendance?.inTime?.time ? 'In-time Marked' : 'Mark In-Time'}
                  </button>
                  <button
                    onClick={handleMarkOutTime}
                    disabled={loading || !todayAttendance?.inTime?.time || todayAttendance?.outTime?.time}
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {todayAttendance?.outTime?.time ? 'Out-time Marked' : 'Mark Out-Time'}
                  </button>
                </div>

                {todayAttendance && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Today's Status:</p>
                    {todayAttendance.inTime && <p>⏰ In: {new Date(todayAttendance.inTime.time).toLocaleTimeString()}</p>}
                    {todayAttendance.outTime && <p>⏰ Out: {new Date(todayAttendance.outTime.time).toLocaleTimeString()}</p>}
                    <p>Status: {todayAttendance.status || 'Not marked'}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#0D5166] mb-4">Instructions</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">📍 Click "Get Current Location" to capture your GPS location</li>
              <li className="flex items-start gap-2">⏰ Mark In-Time when you start work</li>
              <li className="flex items-start gap-2">⏰ Mark Out-Time when you finish work</li>
              <li className="flex items-start gap-2">📝 Add a detailed work report for accurate attendance</li>
              <li className="flex items-start gap-2">⚠️ If you forget to mark attendance, it will be auto-marked as absent</li>
            </ul>
          </div>
        </div>
      )}

      {/* View Attendance Tab */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-[#EADDCD] bg-gray-50 flex flex-wrap gap-4">
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
            <button onClick={fetchMonthlyAttendance} className="px-4 py-2 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f]">
              Load
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.present || 0}</div>
              <div className="text-sm text-gray-500">Present</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.absent || 0}</div>
              <div className="text-sm text-gray-500">Absent</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.halfDay || 0}</div>
              <div className="text-sm text-gray-500">Half Day</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.leave || 0}</div>
              <div className="text-sm text-gray-500">Leave</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{stats.presentPercentage || 0}%</div>
              <div className="text-sm text-gray-500">Attendance</div>
            </div>
          </div>

          {/* Calendar */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div></div>
          ) : (
            <div className="overflow-x-auto p-4">
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center py-2 font-semibold bg-gray-100 rounded-lg">{day}</div>
                ))}
                {calendarData.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-lg border ${day.isSunday ? 'bg-gray-100' : 'bg-white'} ${day.attendance ? getStatusColor(day.attendance.status) : ''}`}
                  >
                    <div className={`text-sm font-medium ${day.isSunday ? 'text-red-500' : 'text-gray-700'}`}>{day.day}</div>
                    {day.attendance && (
                      <div className="mt-1">
                        <div className="flex items-center gap-1 text-xs">
                          {getStatusIcon(day.attendance.status)}
                          <span className="capitalize">{day.attendance.status}</span>
                        </div>
                        {day.attendance.inTime && <p className="text-xs text-gray-500 mt-1">⏰ {new Date(day.attendance.inTime.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AttendanceManagement;