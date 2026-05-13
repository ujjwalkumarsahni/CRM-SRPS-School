// // components/Admin/HolidayManagement.jsx
// import React, { useState, useEffect } from "react";
// import { Calendar as CalendarIcon, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";
// import attendanceService from "../../services/attendanceService";
// import Toast from '../../components/Common/Toast';
// import Swal from "sweetalert2";

// const HolidayManagement = () => {
//   const [holidays, setHolidays] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [editingHoliday, setEditingHoliday] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     date: "",
//     description: "",
//     isRecurring: false
//   });
//   const [toast, setToast] = useState(null);

//   useEffect(() => {
//     fetchHolidays();
//   }, []);

//   const fetchHolidays = async () => {
//     setLoading(true);
//     try {
//       const data = await attendanceService.getAllHolidays();
//       setHolidays(data.data || []);
//     } catch (error) {
//       setToast({ message: "Failed to fetch holidays", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.name || !formData.date) {
//       setToast({ message: "Please fill all required fields", type: "warning" });
//       return;
//     }

//     setLoading(true);
//     try {
//       if (editingHoliday) {
//         await attendanceService.updateHoliday(editingHoliday._id, {
//           name: formData.name,
//           description: formData.description,
//           isRecurring: formData.isRecurring
//         });
//         setToast({ message: "Holiday updated successfully", type: "success" });
//       } else {
//         await attendanceService.createHoliday(formData);
//         setToast({ message: "Holiday created successfully", type: "success" });
//       }
//       setShowModal(false);
//       resetForm();
//       fetchHolidays();
//     } catch (error) {
//       setToast({ message: error.response?.data?.error || "Failed to save holiday", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (holiday) => {
//     const result = await Swal.fire({
//       title: "Delete Holiday?",
//       html: `Are you sure you want to delete <strong>${holiday.name}</strong> on ${new Date(holiday.date).toLocaleDateString()}?<br/>This will remove holiday marking from all teachers' attendance.`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#E22213",
//       confirmButtonText: "Yes, delete",
//       cancelButtonText: "Cancel"
//     });

//     if (result.isConfirmed) {
//       setLoading(true);
//       try {
//         await attendanceService.deleteHoliday(holiday._id);
//         setToast({ message: "Holiday deleted successfully", type: "success" });
//         fetchHolidays();
//       } catch (error) {
//         setToast({ message: "Failed to delete holiday", type: "error" });
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({ name: "", date: "", description: "", isRecurring: false });
//     setEditingHoliday(null);
//   };

//   const openEditModal = (holiday) => {
//     setEditingHoliday(holiday);
//     setFormData({
//       name: holiday.name,
//       date: new Date(holiday.date).toISOString().split("T")[0],
//       description: holiday.description || "",
//       isRecurring: holiday.isRecurring
//     });
//     setShowModal(true);
//   };

//   const groupHolidaysByMonth = () => {
//     const grouped = {};
//     holidays.forEach(holiday => {
//       const date = new Date(holiday.date);
//       const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
//       if (!grouped[monthYear]) grouped[monthYear] = [];
//       grouped[monthYear].push(holiday);
//     });
//     return grouped;
//   };

//   const groupedHolidays = groupHolidaysByMonth();

//   return (
//     <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//       <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4 flex justify-between items-center">
//         <div>
//           <h2 className="text-white font-semibold text-lg">Holiday Management</h2>
//           <p className="text-[#F5C78B] text-sm">Create and manage holidays (applies to all teachers)</p>
//         </div>
//         <button
//           onClick={() => { resetForm(); setShowModal(true); }}
//           className="flex items-center gap-2 px-4 py-2 bg-white text-[#0D5166] rounded-lg hover:bg-gray-100 transition-colors"
//         >
//           <Plus size={18} />
//           Add Holiday
//         </button>
//       </div>

//       {loading && holidays.length === 0 && (
//         <div className="flex justify-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div>
//         </div>
//       )}

//       {!loading && holidays.length === 0 && (
//         <div className="text-center py-12">
//           <CalendarIcon size={48} className="mx-auto text-gray-300 mb-3" />
//           <p className="text-gray-500">No holidays added yet</p>
//           <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-4 text-[#0D5166] hover:underline">
//             Add your first holiday
//           </button>
//         </div>
//       )}

//       {Object.entries(groupedHolidays).map(([monthYear, monthHolidays]) => (
//         <div key={monthYear} className="border-b border-[#EADDCD] last:border-b-0">
//           <div className="bg-[#F5F0EB] px-6 py-3">
//             <h3 className="font-semibold text-[#0D5166]">{monthYear}</h3>
//           </div>
//           <div className="divide-y divide-[#EADDCD]">
//             {monthHolidays.map((holiday) => (
//               <div key={holiday._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-1">
//                       <span className="font-semibold text-gray-800">{holiday.name}</span>
//                       {holiday.isRecurring && (
//                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recurring</span>
//                       )}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       {new Date(holiday.date).toLocaleDateString('en-US', { 
//                         weekday: 'long', 
//                         year: 'numeric', 
//                         month: 'long', 
//                         day: 'numeric' 
//                       })}
//                     </div>
//                     {holiday.description && (
//                       <p className="text-sm text-gray-600 mt-1">{holiday.description}</p>
//                     )}
//                   </div>
//                   <div className="flex gap-2">
//                     <button onClick={() => openEditModal(holiday)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
//                       <Edit size={18} />
//                     </button>
//                     <button onClick={() => handleDelete(holiday)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}

//       {/* Holiday Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
//             <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4 flex justify-between items-center rounded-t-2xl">
//               <h3 className="text-white font-semibold text-lg">
//                 {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
//               </h3>
//               <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white hover:text-gray-200">
//                 <X size={24} />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                   placeholder="e.g., Republic Day, Diwali, Christmas"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
//                 <input
//                   type="date"
//                   value={formData.date}
//                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   rows="3"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                   placeholder="Additional information about this holiday..."
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="isRecurring"
//                   checked={formData.isRecurring}
//                   onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
//                   className="w-4 h-4 text-[#0D5166] rounded focus:ring-[#0D5166]"
//                 />
//                 <label htmlFor="isRecurring" className="text-sm text-gray-700">
//                   Recurring yearly (e.g., Republic Day, Independence Day)
//                 </label>
//               </div>
//               <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
//                 <AlertCircle size={16} className="text-blue-600 mt-0.5" />
//                 <p className="text-xs text-blue-700">
//                   When you create a holiday, all teachers' attendance for that date will be automatically marked as "Holiday". Sundays are already marked as holidays by default.
//                 </p>
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] disabled:opacity-50"
//                 >
//                   {loading ? "Saving..." : (editingHoliday ? "Update Holiday" : "Create Holiday")}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => { setShowModal(false); resetForm(); }}
//                   className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// };

// export default HolidayManagement;


// components/Admin/HolidayManagement.jsx
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, X, AlertCircle, Loader } from "lucide-react";
import attendanceService from "../../../services/attendanceService";
import Toast from '../../../components/Common/Toast';
import Swal from "sweetalert2";

const HolidayManagement = () => {
  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7"
  };

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    isRecurring: false
  });
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAllHolidays();
      setHolidays(data.data || []);
    } catch (error) {
      setToast({ message: "Failed to fetch holidays", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      setToast({ message: "Please fill all required fields", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      if (editingHoliday) {
        await attendanceService.updateHoliday(editingHoliday._id, {
          name: formData.name,
          description: formData.description,
          isRecurring: formData.isRecurring
        });
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Holiday updated successfully',
          confirmButtonColor: colors.primary,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await attendanceService.createHoliday(formData);
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Holiday created successfully',
          confirmButtonColor: colors.primary,
          timer: 2000,
          timerProgressBar: true
        });
      }
      setShowModal(false);
      resetForm();
      fetchHolidays();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.error || "Failed to save holiday",
        confirmButtonColor: colors.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (holiday) => {
    const result = await Swal.fire({
      title: 'Delete Holiday?',
      html: `Are you sure you want to delete <strong>${holiday.name}</strong>?<br/><span style="font-size: 12px;">Date: ${new Date(holiday.date).toLocaleDateString()}</span><br/><span style="font-size: 12px; color: #ef4444;">This will remove holiday marking from all teachers' attendance.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.accent,
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await attendanceService.deleteHoliday(holiday._id);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Holiday deleted successfully',
          confirmButtonColor: colors.primary,
          timer: 2000,
          timerProgressBar: true
        });
        fetchHolidays();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete holiday',
          confirmButtonColor: colors.primary
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", date: "", description: "", isRecurring: false });
    setEditingHoliday(null);
  };

  const openEditModal = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split("T")[0],
      description: holiday.description || "",
      isRecurring: holiday.isRecurring
    });
    setShowModal(true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHolidays = holidays.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(holidays.length / itemsPerPage);

  const getStatusBadge = (isRecurring) => {
    if (isRecurring) {
      return {
        text: 'Recurring',
        bg: colors.secondary,
        color: 'white'
      };
    }
    return {
      text: 'One-time',
      bg: '#6c757d',
      color: 'white'
    };
  };

  if (loading && holidays.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
            <p style={{ color: colors.primary }}>Loading holidays...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: colors.primary }}>
        <div>
          <h2 className="text-white font-semibold text-lg">Holiday Management</h2>
          <p className="text-sm" style={{ color: colors.secondary }}>Create and manage holidays (applies to all teachers)</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: colors.primary }}
        >
          <Plus size={18} />
          Add Holiday
        </button>
      </div>

      {!loading && holidays.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No holidays added yet</p>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="mt-4 hover:underline"
            style={{ color: colors.primary }}
          >
            Add your first holiday
          </button>
        </div>
      )}

      {holidays.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: colors.light }}>
              <tr>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>S.No</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Holiday Name</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Date</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Day</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Type</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Description</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentHolidays.map((holiday, index) => {
                const holidayDate = new Date(holiday.date);
                const status = getStatusBadge(holiday.isRecurring);
                return (
                  <tr key={holiday._id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: colors.light }}>
                    <td className="py-3 px-4 text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{holiday.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {holidayDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {holidayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: status.bg, color: status.color }}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">
                      {holiday.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(holiday)} 
                          className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{ color: colors.primary }}
                          title="Edit Holiday"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(holiday)} 
                          className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{ color: colors.accent }}
                          title="Delete Holiday"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t" style={{ borderColor: colors.light }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, holidays.length)} of {holidays.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ color: colors.primary }}
              >
                Previous
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
                      className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                      style={currentPage === pageNum ? { backgroundColor: colors.primary } : { color: colors.primary }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ color: colors.primary }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 flex justify-between items-center rounded-t-2xl" style={{ backgroundColor: colors.primary }}>
              <h3 className="text-white font-semibold text-lg">
                {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
              </h3>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name <span style={{ color: colors.accent }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  placeholder="e.g., Republic Day, Diwali, Christmas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span style={{ color: colors.accent }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  placeholder="Additional information about this holiday..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 rounded focus:ring-2 focus:ring-opacity-50"
                  style={{ accentColor: colors.primary }}
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-700">
                  Recurring yearly (e.g., Republic Day, Independence Day)
                </label>
              </div>
              <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: colors.light }}>
                <AlertCircle size={16} className="mt-0.5" style={{ color: colors.primary }} />
                <p className="text-xs" style={{ color: colors.primary }}>
                  When you create a holiday, all teachers' attendance for that date will be automatically marked as "Holiday". Sundays are already marked as holidays by default.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? "Saving..." : (editingHoliday ? "Update Holiday" : "Create Holiday")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2 rounded-lg transition-all duration-200"
                  style={{ backgroundColor: colors.light, color: colors.primary }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default HolidayManagement;