// import React, { useState, useEffect } from "react";
// import {
//   RefreshCw,
//   Edit,
//   X,
//   MapPin,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Calendar,
//   User as UserIcon,
//   Plus,
//   Lock,
//   Bell,
//   Download,
//   FileSpreadsheet,
//   Users,
//   UserCheck,
// } from "lucide-react";
// import HolidayManagement from "./HolidayManagement";
// import attendanceService from "../../services/attendanceService";
// import Swal from "sweetalert2";
// import UpdateRequestsTab from "./UpdateRequestsTab";

// const AttendanceManagement = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [calendarData, setCalendarData] = useState([]);
//   const [stats, setStats] = useState({});
//   const [teacherInfo, setTeacherInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedAttendance, setSelectedAttendance] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [selectedDateForCreation, setSelectedDateForCreation] = useState(null);
//   const [editForm, setEditForm] = useState({
//     status: "",
//     workReport: "",
//     inTime: "",
//     outTime: "",
//   });
//   const [createForm, setCreateForm] = useState({
//     status: "",
//     workReport: "",
//     inTime: "",
//     outTime: "",
//   });
//   const [viewMode, setViewMode] = useState("calendar");
//   const [hoveredCell, setHoveredCell] = useState(null);
//   const [activeMainTab, setActiveMainTab] = useState("attendance");

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

//   useEffect(() => {
//     fetchTeachers();
//   }, []);

//   useEffect(() => {
//     if (selectedTeacher) {
//       fetchMonthlyAttendance();
//     }
//   }, [selectedTeacher, selectedMonth, selectedYear]);

//   const showAlert = (icon, title, message) => {
//     Swal.fire({
//       icon: icon,
//       title: title,
//       text: message,
//       confirmButtonColor: "#0D5166",
//       timer: icon === "success" ? 2000 : undefined,
//       timerProgressBar: icon === "success",
//     });
//   };

//   const fetchTeachers = async () => {
//     try {
//       const data = await attendanceService.getAllTeachersForAttendance();
//       setTeachers(data.data || []);
//       if (data.data && data.data.length > 0 && !selectedTeacher) {
//         setSelectedTeacher(data.data[0]);
//       }
//     } catch (error) {
//       showAlert("error", "Error!", "Failed to fetch teachers");
//     }
//   };

//   const fetchMonthlyAttendance = async () => {
//     if (!selectedTeacher) return;
//     setLoading(true);
//     try {
//       const data = await attendanceService.getTeacherMonthlyAttendance(
//         selectedTeacher._id,
//         selectedMonth,
//         selectedYear,
//       );
//       setCalendarData([...(data.data?.calendarData || [])]);
//       setStats({ ...(data.data?.stats || {}) });
//       setTeacherInfo({ ...(data.data?.teacher || {}) });
//     } catch (error) {
//       showAlert("error", "Error!", "Failed to fetch attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== EXCEL DOWNLOAD FUNCTIONS ====================

//   const downloadSingleTeacherExcel = async () => {
//     if (!selectedTeacher) {
//       showAlert(
//         "warning",
//         "No Teacher Selected",
//         "Please select a teacher first",
//       );
//       return;
//     }

//     Swal.fire({
//       title: "Generating Report...",
//       allowOutsideClick: false,
//       showConfirmButton: false,
//       willOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     try {
//       const blob = await attendanceService.downloadTeacherAttendanceExcel(
//         selectedTeacher._id,
//         selectedMonth,
//         selectedYear,
//       );

//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute(
//         "download",
//         `Attendance_${selectedTeacher.name}_${months[selectedMonth - 1]}_${selectedYear}.xlsx`,
//       );
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);

//       Swal.close();
//       showAlert(
//         "success",
//         "Success!",
//         "Attendance report downloaded successfully",
//       );
//     } catch (error) {
//       Swal.close();
//       showAlert("error", "Failed!", "Failed to download attendance report");
//     }
//   };

//   const downloadAllTeachersExcel = async () => {
//     const result = await Swal.fire({
//       title: "Download All Teachers Report?",
//       html: `
//         <div class="text-left">
//           <p class="mb-2">This will generate a comprehensive report for:</p>
//           <ul class="list-disc pl-5 mb-3">
//             <li>All ${teachers.length} teachers</li>
//             <li>Month: <strong>${months[selectedMonth - 1]} ${selectedYear}</strong></li>
//           </ul>
//           <p class="text-sm text-gray-500">The report includes summary and detailed sheets.</p>
//         </div>
//       `,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#0D5166",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, Download",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       Swal.fire({
//         title: "Generating Report...",
//         text: "Please wait while we prepare the data",
//         allowOutsideClick: false,
//         showConfirmButton: false,
//         willOpen: () => {
//           Swal.showLoading();
//         },
//       });

//       try {
//         const blob = await attendanceService.downloadAllTeachersAttendanceExcel(
//           selectedMonth,
//           selectedYear,
//         );

//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.setAttribute(
//           "download",
//           `All_Teachers_Attendance_${months[selectedMonth - 1]}_${selectedYear}.xlsx`,
//         );
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);

//         Swal.close();
//         showAlert(
//           "success",
//           "Success!",
//           "All teachers report downloaded successfully",
//         );
//       } catch (error) {
//         Swal.close();
//         showAlert("error", "Failed!", "Failed to download report");
//       }
//     }
//   };

//   const handleEditClick = (attendance) => {
//     const attendanceDate = new Date(attendance.date);
//     const isHoliday = attendance.isHoliday || false;

//     if (attendanceDate.getDay() === 0) {
//       showAlert(
//         "warning",
//         "Cannot Edit",
//         "Cannot edit attendance on Sunday (Holiday)",
//       );
//       return;
//     }

//     const formatExistingTime = (time) => {
//       if (!time) return "";
//       const date = new Date(time);
//       if (isNaN(date.getTime())) return "";
//       const hours = String(date.getHours()).padStart(2, "0");
//       const minutes = String(date.getMinutes()).padStart(2, "0");
//       return `${hours}:${minutes}`;
//     };

//     setSelectedAttendance(attendance);
//     setEditForm({
//       status: attendance.status || "",
//       workReport: attendance.workReport || "",
//       inTime: attendance.inTime?.time
//         ? formatExistingTime(attendance.inTime.time)
//         : "",
//       outTime: attendance.outTime?.time
//         ? formatExistingTime(attendance.outTime.time)
//         : "",
//     });
//     setShowEditModal(true);
//   };

//   const handleCreateClick = (date, dayData) => {
//     const checkDate = new Date(date);
//     if (checkDate.getDay() === 0) {
//       showAlert(
//         "warning",
//         "Cannot Add",
//         "Cannot add attendance on Sunday (Holiday)",
//       );
//       return;
//     }

//     setSelectedDateForCreation({
//       date: date,
//       day: dayData.day,
//       formattedDate: checkDate,
//     });
//     setCreateForm({
//       status: "present",
//       workReport: "",
//       inTime: "",
//       outTime: "",
//     });
//     setShowCreateModal(true);
//   };

//   const handleCreateAttendance = async () => {
//     if (!createForm.status) {
//       showAlert(
//         "warning",
//         "Missing Information",
//         "Please select attendance status",
//       );
//       return;
//     }

//     setLoading(true);
//     Swal.fire({
//       title: "Creating...",
//       allowOutsideClick: false,
//       showConfirmButton: false,
//       willOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     try {
//       const createData = {
//         teacherId: selectedTeacher._id,
//         date: selectedDateForCreation.date,
//         status: createForm.status,
//         workReport: createForm.workReport || "",
//       };

//       if (createForm.inTime) {
//         const [hours, minutes] = createForm.inTime.split(":");
//         const inDateTime = new Date(selectedDateForCreation.date);
//         inDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
//         createData.inTime = { time: inDateTime };
//       }

//       if (createForm.outTime) {
//         const [hours, minutes] = createForm.outTime.split(":");
//         const outDateTime = new Date(selectedDateForCreation.date);
//         outDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
//         createData.outTime = { time: outDateTime };
//       }

//       await attendanceService.createAttendanceByAdmin(createData);
//       Swal.close();
//       showAlert("success", "Success!", "Attendance created successfully");
//       setShowCreateModal(false);
//       fetchMonthlyAttendance();
//     } catch (error) {
//       Swal.close();
//       showAlert(
//         "error",
//         "Failed!",
//         error.response?.data?.error || "Failed to create attendance",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateAttendance = async () => {
//     setLoading(true);
//     Swal.fire({
//       title: "Updating...",
//       allowOutsideClick: false,
//       showConfirmButton: false,
//       willOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     try {
//       const updateData = {
//         status: editForm.status,
//         workReport: editForm.workReport,
//       };

//       const createDateTime = (date, time) => {
//         if (!time) return null;
//         const [h, m] = time.split(":");
//         if (!h || !m) return null;
//         const d = new Date(date);
//         if (isNaN(d)) return null;
//         d.setHours(Number(h), Number(m), 0, 0);
//         return isNaN(d) ? null : d;
//       };

//       const inTime = createDateTime(selectedAttendance?.date, editForm.inTime);
//       if (inTime) {
//         updateData.inTime = {
//           time: inTime,
//           location: selectedAttendance.inTime?.location,
//         };
//       }

//       const outTime = createDateTime(
//         selectedAttendance?.date,
//         editForm.outTime,
//       );
//       if (outTime) {
//         updateData.outTime = {
//           time: outTime,
//           location: selectedAttendance.outTime?.location,
//         };
//       }

//       await attendanceService.updateAttendanceByAdmin(
//         selectedAttendance._id,
//         updateData,
//       );
//       Swal.close();
//       showAlert("success", "Success!", "Attendance updated successfully");
//       setShowEditModal(false);
//       await fetchMonthlyAttendance();
//     } catch (error) {
//       Swal.close();
//       showAlert("error", "Failed!", "Failed to update attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusStyle = (status, isSunday = false, isHoliday = false) => {
//     if (isSunday || isHoliday) {
//       return {
//         bg: "bg-purple-100",
//         text: "text-purple-700",
//         border: "border-purple-300",
//         icon: <Calendar size={12} className="text-purple-600" />,
//         label: "Holiday",
//       };
//     }

//     switch (status) {
//       case "present":
//         return {
//           bg: "bg-green-100",
//           text: "text-green-700",
//           border: "border-green-300",
//           icon: <CheckCircle size={12} className="text-green-600" />,
//           label: "P",
//         };
//       case "absent":
//         return {
//           bg: "bg-red-100",
//           text: "text-red-700",
//           border: "border-red-300",
//           icon: <XCircle size={12} className="text-red-600" />,
//           label: "A",
//         };
//       case "half-day":
//         return {
//           bg: "bg-orange-100",
//           text: "text-orange-700",
//           border: "border-orange-300",
//           icon: <Clock size={12} className="text-orange-600" />,
//           label: "HD",
//         };
//       case "leave":
//         return {
//           bg: "bg-blue-100",
//           text: "text-blue-700",
//           border: "border-blue-300",
//           icon: <Calendar size={12} className="text-blue-600" />,
//           label: "L",
//         };
//       default:
//         return {
//           bg: "bg-gray-100",
//           text: "text-gray-600",
//           border: "border-gray-300",
//           icon: null,
//           label: "-",
//         };
//     }
//   };

//   const formatLocation = (location) => {
//     if (!location) return "No location";
//     if (location.address) {
//       const addressParts = location.address.split(",");
//       if (addressParts.length >= 2) {
//         return `${addressParts[0].trim()}, ${addressParts[1].trim()}`;
//       }
//       return location.address.length > 40
//         ? location.address.substring(0, 40) + "..."
//         : location.address;
//     }
//     return `${location.lat?.toFixed(6)}, ${location.lng?.toFixed(6)}`;
//   };

//   const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
//   const getFirstDayOfMonth = (year, month) => {
//     const day = new Date(year, month - 1, 1).getDay();
//     return day === 0 ? 6 : day - 1;
//   };

//   const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
//   const currentYear = new Date().getFullYear();
//   const startYear = 2026;
//   const endYear = currentYear + 2;
//   const years = Array.from(
//     { length: endYear - startYear + 1 },
//     (_, i) => startYear + i,
//   );

//   return (
//     <div className="pt-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-[#0D5166]">
//           Attendance Management
//         </h1>
//         <p className="text-gray-500 text-sm mt-1">
//           Monitor and manage staff attendance (Sundays are auto-marked as
//           Holiday)
//         </p>
//       </div>

//       {/* Main Tabs */}
//       <div className="flex flex-wrap gap-2 mb-6 border-b border-[#EADDCD]">
//         <button
//           onClick={() => setActiveMainTab("attendance")}
//           className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
//             activeMainTab === "attendance"
//               ? "bg-[#0D5166] text-white shadow-lg"
//               : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
//           }`}
//         >
//           <span className="hidden sm:inline">Attendance Sheet</span>
//           <span className="sm:hidden">Attendance</span>
//         </button>
//         <button
//           onClick={() => setActiveMainTab("requests")}
//           className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
//             activeMainTab === "requests"
//               ? "bg-[#0D5166] text-white shadow-lg"
//               : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
//           }`}
//         >
//           <span className="hidden sm:inline">Update Requests</span>
//           <span className="sm:hidden">Requests</span>
//         </button>
//         <button
//           onClick={() => setActiveMainTab("holidays")}
//           className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
//             activeMainTab === "holidays"
//               ? "bg-[#0D5166] text-white shadow-lg"
//               : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
//           }`}
//         >
//           <span className="hidden sm:inline">Holidays</span>
//           <span className="sm:hidden">Holidays</span>
//         </button>
//       </div>

//       {/* Attendance Sheet Tab */}
//       {activeMainTab === "attendance" && (
//         <>
//           {/* Teacher Selection Dropdown */}
//           <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
//             <div className="bg-[#0D5166] px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//               <h2 className="text-white font-semibold">Select Staff Member</h2>
//               <div className="flex gap-2">
//                 <button
//                   onClick={downloadSingleTeacherExcel}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
//                 >
//                   <Download size={16} />
//                   <span className="hidden sm:inline">Download Current</span>
//                   <span className="sm:hidden">Download</span>
//                 </button>
//                 <button
//                   onClick={downloadAllTeachersExcel}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
//                 >
//                   <FileSpreadsheet size={16} />
//                   <span className="hidden sm:inline">Download All</span>
//                   <span className="sm:hidden">All</span>
//                 </button>
//               </div>
//             </div>
//             <div className="p-4">
//               <select
//                 value={selectedTeacher?._id || ""}
//                 onChange={(e) => {
//                   const teacher = teachers.find(
//                     (t) => t._id === e.target.value,
//                   );
//                   setSelectedTeacher(teacher);
//                 }}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//               >
//                 <option value="">Select a teacher...</option>
//                 {teachers.map((teacher) => (
//                   <option key={teacher._id} value={teacher._id}>
//                     {teacher.name} - {teacher.designation}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Attendance Section */}
//           {selectedTeacher && teacherInfo && (
//             <>
//               {/* Stats Cards - From Backend */}
//               <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
//                 <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#0D5166]">
//                   <div className="text-xl md:text-3xl font-bold text-[#0D5166]">
//                     {stats.presentCount || 0}
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-500 mt-1">
//                     Present Days
//                   </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#E22213]">
//                   <div className="text-xl md:text-3xl font-bold text-[#E22213]">
//                     {stats.absentCount || 0}
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-500 mt-1">
//                     Absent Days
//                   </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#EA8E0A]">
//                   <div className="text-xl md:text-3xl font-bold text-[#EA8E0A]">
//                     {stats.halfDayCount || 0}
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-500 mt-1">
//                     Half Days
//                   </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-blue-500">
//                   <div className="text-xl md:text-3xl font-bold text-blue-500">
//                     {stats.leaveCount || 0}
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-500 mt-1">
//                     Leave Days
//                   </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#0D5166]">
//                   <div className="text-xl md:text-3xl font-bold text-[#0D5166]">
//                     {stats.presentPercentage || 0}%
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-500 mt-1">
//                     Attendance Rate
//                   </div>
//                   <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
//                     <div
//                       className="bg-[#0D5166] h-1.5 rounded-full transition-all duration-500"
//                       style={{ width: `${stats.presentPercentage || 0}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Filters */}
//               <div className="bg-white rounded-xl shadow-md p-4 mb-6">
//                 <div className="flex flex-wrap gap-3 items-center justify-between">
//                   <div className="flex gap-2">
//                     <select
//                       value={selectedMonth}
//                       onChange={(e) =>
//                         setSelectedMonth(parseInt(e.target.value))
//                       }
//                       className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] text-sm"
//                     >
//                       {months.map((month, index) => (
//                         <option key={index} value={index + 1}>
//                           {month.substring(0, 3)}
//                         </option>
//                       ))}
//                     </select>
//                     <select
//                       value={selectedYear}
//                       onChange={(e) =>
//                         setSelectedYear(parseInt(e.target.value))
//                       }
//                       className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] text-sm"
//                     >
//                       {years.map((year) => (
//                         <option key={year} value={year}>
//                           {year}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setViewMode("calendar")}
//                       className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all ${viewMode === "calendar" ? "bg-[#0D5166] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
//                     >
//                       Calendar
//                     </button>
//                     <button
//                       onClick={() => setViewMode("list")}
//                       className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all ${viewMode === "list" ? "bg-[#0D5166] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
//                     >
//                       List
//                     </button>
//                     <button
//                       onClick={fetchMonthlyAttendance}
//                       className="px-2 md:px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
//                     >
//                       <RefreshCw size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Loading */}
//               {loading && (
//                 <div className="flex justify-center py-12">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div>
//                 </div>
//               )}

//               {/* Calendar View */}
//               {!loading && viewMode === "calendar" && (
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                   <div className="bg-[#0D5166] px-4 py-2">
//                     <h2 className="text-white font-semibold text-center text-sm md:text-base">
//                       {months[selectedMonth - 1]} {selectedYear}
//                     </h2>
//                   </div>
//                   <div className="overflow-x-auto p-2">
//                     <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1">
//                       {weekdays.map((day) => (
//                         <div
//                           key={day}
//                           className="text-center py-1 text-[10px] md:text-xs font-semibold bg-gray-100 rounded-md text-[#0D5166]"
//                         >
//                           {day}
//                         </div>
//                       ))}
//                     </div>
//                     <div className="grid grid-cols-7 gap-0.5 md:gap-1">
//                       {Array.from({ length: firstDay }).map((_, i) => (
//                         <div
//                           key={`empty-${i}`}
//                           className="min-h-15 md:min-h-20 bg-gray-50 rounded-md"
//                         ></div>
//                       ))}
//                       {calendarData.map((day, idx) => {
//                         const isSunday = day.isSunday;
//                         const isHoliday = day.isHoliday || false;
//                         const style = getStatusStyle(
//                           day.attendance?.status,
//                           isSunday,
//                           isHoliday,
//                         );
//                         const isHovered = hoveredCell === idx;
//                         const hasAttendance = !!day.attendance;
//                         const isEditable = !isSunday && !isHoliday;

//                         return (
//                           <div
//                             key={idx}
//                             onMouseEnter={() => setHoveredCell(idx)}
//                             onMouseLeave={() => setHoveredCell(null)}
//                             onClick={() => {
//                               if (!isEditable) {
//                                 if (isSunday)
//                                   showAlert(
//                                     "warning",
//                                     "Cannot Edit",
//                                     "Sunday is a holiday. Cannot modify attendance.",
//                                   );
//                                 else if (isHoliday)
//                                   showAlert(
//                                     "warning",
//                                     "Cannot Edit",
//                                     "This day is a holiday. Cannot modify attendance.",
//                                   );
//                                 return;
//                               }
//                               if (hasAttendance) {
//                                 handleEditClick(day.attendance);
//                               } else {
//                                 handleCreateClick(day.date, day);
//                               }
//                             }}
//                             className={`min-h-15 md:min-h-20 p-1 md:p-1.5 rounded-md border transition-all ${isSunday || isHoliday ? `${style?.bg} ${style?.border} cursor-not-allowed opacity-60` : hasAttendance ? "bg-white border-gray-200 cursor-pointer hover:bg-gray-50" : "bg-white border-dashed border-gray-300 cursor-pointer hover:border-[#0D5166] hover:bg-blue-50"} ${isHovered && isEditable && hasAttendance ? "shadow-md scale-[1.01]" : ""}`}
//                           >
//                             <div className="text-xs md:text-sm font-medium flex justify-between items-center text-gray-700">
//                               <span>{day.day}</span>
//                               {(isSunday || isHoliday) && (
//                                 <Calendar
//                                   size={10}
//                                   className="text-purple-600"
//                                 />
//                               )}
//                               {!isSunday && !isHoliday && !hasAttendance && (
//                                 <Plus
//                                   size={10}
//                                   className="text-[#0D5166] opacity-50"
//                                 />
//                               )}
//                             </div>
//                             {isSunday || isHoliday ? (
//                               <div className="mt-1 text-center">
//                                 <div className="text-[9px] md:text-xs flex items-center justify-center gap-0.5 text-purple-600">
//                                   <span>Holiday</span>
//                                 </div>
//                               </div>
//                             ) : hasAttendance ? (
//                               <div className="mt-1">
//                                 <div
//                                   className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${style?.bg} text-[9px] md:text-xs font-medium`}
//                                 >
//                                   <span className={style?.text}>
//                                     {style?.label}
//                                   </span>
//                                 </div>
//                                 {day.attendance.inTime && (
//                                   <div className="text-[8px] md:text-xs text-gray-500 mt-1 hidden sm:block">
//                                     {new Date(
//                                       day.attendance.inTime.time,
//                                     ).toLocaleTimeString([], {
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     })}
//                                   </div>
//                                 )}
//                               </div>
//                             ) : (
//                               <div className="mt-1 text-[9px] md:text-xs text-gray-400 text-center hidden sm:block">
//                                 Click
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* List View */}
//               {!loading && viewMode === "list" && (
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-[#0D5166] text-white sticky top-0">
//                         <tr>
//                           <th className="py-2 px-2 md:px-3 text-left">Date</th>
//                           <th className="py-2 px-2 md:px-3 text-left hidden sm:table-cell">
//                             Day
//                           </th>
//                           <th className="py-2 px-2 md:px-3 text-left">
//                             Status
//                           </th>
//                           <th className="py-2 px-2 md:px-3 text-left hidden md:table-cell">
//                             In Time
//                           </th>
//                           <th className="py-2 px-2 md:px-3 text-left hidden md:table-cell">
//                             Out Time
//                           </th>
//                           <th className="py-2 px-2 md:px-3 text-left hidden lg:table-cell">
//                             Work Report
//                           </th>
//                           <th className="py-2 px-2 md:px-3 text-center">
//                             Action
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {calendarData.map((day, idx) => {
//                           const isSunday = day.isSunday;
//                           const isHoliday = day.isHoliday || false;
//                           const style = getStatusStyle(
//                             day.attendance?.status,
//                             isSunday,
//                             isHoliday,
//                           );
//                           const weekdaysList = [
//                             "Sunday",
//                             "Monday",
//                             "Tuesday",
//                             "Wednesday",
//                             "Thursday",
//                             "Friday",
//                             "Saturday",
//                           ];
//                           const weekdayName =
//                             weekdaysList[
//                               new Date(
//                                 selectedYear,
//                                 selectedMonth - 1,
//                                 day.day,
//                               ).getDay()
//                             ];
//                           return (
//                             <tr
//                               key={idx}
//                               className={`border-b transition-colors ${isSunday || isHoliday ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-[#EADDCD]/30"}`}
//                             >
//                               <td className="py-2 px-2 md:px-3">
//                                 <span className="font-medium text-gray-800">
//                                   {day.day}
//                                 </span>
//                                 <div className="text-xs text-gray-400 sm:hidden">
//                                   {weekdayName.substring(0, 3)}
//                                 </div>
//                               </td>
//                               <td className="py-2 px-2 md:px-3 hidden sm:table-cell">
//                                 <span
//                                   className={`text-sm ${isSunday ? "text-red-500 font-semibold" : "text-gray-600"}`}
//                                 >
//                                   {weekdayName}
//                                 </span>
//                               </td>
//                               <td className="py-2 px-2 md:px-3">
//                                 {isSunday || isHoliday ? (
//                                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-600">
//                                     <Calendar size={12} />{" "}
//                                     <span className="hidden xs:inline">
//                                       Holiday
//                                     </span>
//                                   </span>
//                                 ) : day.attendance ? (
//                                   <span
//                                     className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style?.bg} ${style?.text}`}
//                                   >
//                                     {style?.icon}
//                                     <span className="capitalize">
//                                       {style?.label === "P"
//                                         ? "Present"
//                                         : style?.label === "A"
//                                           ? "Absent"
//                                           : style?.label === "HD"
//                                             ? "Half Day"
//                                             : style?.label === "L"
//                                               ? "Leave"
//                                               : style?.label}
//                                     </span>
//                                   </span>
//                                 ) : (
//                                   <button
//                                     onClick={() =>
//                                       handleCreateClick(day.date, day)
//                                     }
//                                     className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600 hover:bg-blue-100"
//                                   >
//                                     <Plus size={12} />
//                                     <span className="hidden xs:inline">
//                                       Add
//                                     </span>
//                                   </button>
//                                 )}
//                               </td>
//                               <td className="py-2 px-2 md:px-3 hidden md:table-cell">
//                                 {!isSunday &&
//                                 !isHoliday &&
//                                 day.attendance?.inTime
//                                   ? new Date(
//                                       day.attendance.inTime.time,
//                                     ).toLocaleTimeString([], {
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     })
//                                   : "-"}
//                               </td>
//                               <td className="py-2 px-2 md:px-3 hidden md:table-cell">
//                                 {!isSunday &&
//                                 !isHoliday &&
//                                 day.attendance?.outTime
//                                   ? new Date(
//                                       day.attendance.outTime.time,
//                                     ).toLocaleTimeString([], {
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     })
//                                   : "-"}
//                               </td>
//                               <td className="py-2 px-2 md:px-3 hidden lg:table-cell text-gray-500 max-w-[150px] truncate">
//                                 {!isSunday &&
//                                 !isHoliday &&
//                                 day.attendance?.workReport
//                                   ? day.attendance.workReport.substring(0, 30)
//                                   : "-"}
//                               </td>
//                               <td className="py-2 px-2 md:px-3 text-center">
//                                 {!isSunday && !isHoliday && day.attendance && (
//                                   <button
//                                     onClick={() =>
//                                       handleEditClick(day.attendance)
//                                     }
//                                     className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
//                                   >
//                                     <Edit size={16} />
//                                   </button>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                     {calendarData.length === 0 && (
//                       <div className="text-center py-8 text-gray-500">
//                         <Calendar
//                           size={48}
//                           className="mx-auto mb-2 text-gray-300"
//                         />
//                         <p>No attendance records found</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </>
//       )}

//       {/* Update Requests Tab */}
//       {activeMainTab === "requests" && <UpdateRequestsTab />}

//       {/* Holidays Tab */}
//       {activeMainTab === "holidays" && <HolidayManagement />}

//       {/* Edit Modal */}
//       {showEditModal && selectedAttendance && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="bg-[#0D5166] px-4 py-3 flex justify-between items-center sticky top-0">
//               <h3 className="text-white font-semibold">Edit Attendance</h3>
//               <button
//                 onClick={() => setShowEditModal(false)}
//                 className="text-white hover:text-gray-200"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Status
//                 </label>
//                 <select
//                   value={editForm.status}
//                   onChange={(e) =>
//                     setEditForm({ ...editForm, status: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                 >
//                   <option value="">Select Status</option>
//                   <option value="present">Present</option>
//                   <option value="absent">Absent</option>
//                   <option value="half-day">Half Day</option>
//                   <option value="leave">Leave</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Work Report
//                 </label>
//                 <textarea
//                   value={editForm.workReport}
//                   onChange={(e) =>
//                     setEditForm({ ...editForm, workReport: e.target.value })
//                   }
//                   rows="3"
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                   placeholder="Enter work report..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     In Time
//                   </label>
//                   <input
//                     type="time"
//                     value={editForm.inTime}
//                     onChange={(e) =>
//                       setEditForm({ ...editForm, inTime: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border rounded-lg"
//                   />
//                   {selectedAttendance.inTime?.time && (
//                     <p className="text-xs text-gray-400 mt-1">
//                       Current:{" "}
//                       {new Date(
//                         selectedAttendance.inTime.time,
//                       ).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Out Time
//                   </label>
//                   <input
//                     type="time"
//                     value={editForm.outTime}
//                     onChange={(e) =>
//                       setEditForm({ ...editForm, outTime: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border rounded-lg"
//                   />
//                   {selectedAttendance.outTime?.time && (
//                     <p className="text-xs text-gray-400 mt-1">
//                       Current:{" "}
//                       {new Date(
//                         selectedAttendance.outTime.time,
//                       ).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {selectedAttendance.inTime?.location && (
//                 <div className="bg-blue-50 p-3 rounded-lg">
//                   <p className="text-xs font-semibold text-[#0D5166] mb-2 flex items-center gap-1">
//                     <MapPin size={12} /> Location
//                   </p>
//                   <p className="text-sm text-gray-700">
//                     {selectedAttendance.inTime.location.address ||
//                       "Location not available"}
//                   </p>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-2">
//                 <button
//                   onClick={handleUpdateAttendance}
//                   disabled={loading}
//                   className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {loading && (
//                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                   )}
//                   Save Changes
//                 </button>
//                 <button
//                   onClick={() => setShowEditModal(false)}
//                   className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Attendance Modal */}
//       {showCreateModal && selectedDateForCreation && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="bg-[#0D5166] px-4 py-3 flex justify-between items-center sticky top-0">
//               <h3 className="text-white font-semibold">Add Attendance</h3>
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className="text-white hover:text-gray-200"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date
//                 </label>
//                 <input
//                   type="text"
//                   value={new Date(
//                     selectedDateForCreation.date,
//                   ).toLocaleDateString()}
//                   disabled
//                   className="w-full px-3 py-2 border rounded-lg bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Status <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={createForm.status}
//                   onChange={(e) =>
//                     setCreateForm({ ...createForm, status: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                   required
//                 >
//                   <option value="present">Present</option>
//                   <option value="absent">Absent</option>
//                   <option value="half-day">Half Day</option>
//                   <option value="leave">Leave</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Work Report
//                 </label>
//                 <textarea
//                   value={createForm.workReport}
//                   onChange={(e) =>
//                     setCreateForm({ ...createForm, workReport: e.target.value })
//                   }
//                   rows="3"
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
//                   placeholder="Enter work report..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     In Time (Optional)
//                   </label>
//                   <input
//                     type="time"
//                     value={createForm.inTime}
//                     onChange={(e) =>
//                       setCreateForm({ ...createForm, inTime: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border rounded-lg"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Out Time (Optional)
//                   </label>
//                   <input
//                     type="time"
//                     value={createForm.outTime}
//                     onChange={(e) =>
//                       setCreateForm({ ...createForm, outTime: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border rounded-lg"
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button
//                   onClick={handleCreateAttendance}
//                   disabled={loading}
//                   className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {loading ? (
//                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                   ) : (
//                     <Plus size={16} />
//                   )}
//                   Create
//                 </button>
//                 <button
//                   onClick={() => setShowCreateModal(false)}
//                   className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendanceManagement;

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Edit,
  X,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User as UserIcon,
  Plus,
  Lock,
  Bell,
  Download,
  FileSpreadsheet,
  Users,
  UserCheck,
  Loader,
} from "lucide-react";
import HolidayManagement from "./HolidayManagement";
import attendanceService from "../../../services/attendanceService";
import Swal from "sweetalert2";
import UpdateRequestsTab from "./UpdateRequestsTab";

const AttendanceManagement = () => {
  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7",
  };

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState([]);
  const [stats, setStats] = useState({});
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDateForCreation, setSelectedDateForCreation] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    workReport: "",
    inTime: "",
    outTime: "",
  });
  const [createForm, setCreateForm] = useState({
    status: "",
    workReport: "",
    inTime: "",
    outTime: "",
  });
  const [viewMode, setViewMode] = useState("calendar");
  const [hoveredCell, setHoveredCell] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("attendance");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchMonthlyAttendance();
    }
  }, [selectedTeacher, selectedMonth, selectedYear]);

  const showAlert = (icon, title, message) => {
    Swal.fire({
      icon: icon,
      title: title,
      text: message,
      confirmButtonColor: colors.primary,
      timer: icon === "success" ? 2000 : undefined,
      timerProgressBar: icon === "success",
    });
  };

  const fetchTeachers = async () => {
    try {
      const data = await attendanceService.getAllTeachersForAttendance();
      setTeachers(data.data || []);
      if (data.data && data.data.length > 0 && !selectedTeacher) {
        setSelectedTeacher(data.data[0]);
      }
    } catch (error) {
      showAlert("error", "Error!", "Failed to fetch teachers");
    }
  };

  const fetchMonthlyAttendance = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    try {
      const data = await attendanceService.getTeacherMonthlyAttendance(
        selectedTeacher._id,
        selectedMonth,
        selectedYear,
      );
      setCalendarData([...(data.data?.calendarData || [])]);
      setStats({ ...(data.data?.stats || {}) });
      setTeacherInfo({ ...(data.data?.teacher || {}) });
    } catch (error) {
      showAlert("error", "Error!", "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  // ==================== EXCEL DOWNLOAD FUNCTIONS ====================

  const downloadSingleTeacherExcel = async () => {
    if (!selectedTeacher) {
      showAlert(
        "warning",
        "No Teacher Selected",
        "Please select a teacher first",
      );
      return;
    }

    Swal.fire({
      title: "Generating Report...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const blob = await attendanceService.downloadTeacherAttendanceExcel(
        selectedTeacher._id,
        selectedMonth,
        selectedYear,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Attendance_${selectedTeacher.name}_${months[selectedMonth - 1]}_${selectedYear}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.close();
      showAlert(
        "success",
        "Success!",
        "Attendance report downloaded successfully",
      );
    } catch (error) {
      Swal.close();
      showAlert("error", "Failed!", "Failed to download attendance report");
    }
  };

  const downloadAllTeachersExcel = async () => {
    const result = await Swal.fire({
      title: "Download All Teachers Report?",
      html: `
        <div class="text-left">
          <p class="mb-2">This will generate a comprehensive report for:</p>
          <ul class="list-disc pl-5 mb-3">
            <li>All ${teachers.length} teachers</li>
            <li>Month: <strong>${months[selectedMonth - 1]} ${selectedYear}</strong></li>
          </ul>
          <p class="text-sm text-gray-500">The report includes summary and detailed sheets.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Download",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Generating Report...",
        text: "Please wait while we prepare the data",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const blob = await attendanceService.downloadAllTeachersAttendanceExcel(
          selectedMonth,
          selectedYear,
        );

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `All_Teachers_Attendance_${months[selectedMonth - 1]}_${selectedYear}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        Swal.close();
        showAlert(
          "success",
          "Success!",
          "All teachers report downloaded successfully",
        );
      } catch (error) {
        Swal.close();
        showAlert("error", "Failed!", "Failed to download report");
      }
    }
  };

  const handleEditClick = (attendance) => {
    const attendanceDate = new Date(attendance.date);
    const isHoliday = attendance.isHoliday || false;

    if (attendanceDate.getDay() === 0) {
      showAlert(
        "warning",
        "Cannot Edit",
        "Cannot edit attendance on Sunday (Holiday)",
      );
      return;
    }

    const formatExistingTime = (time) => {
      if (!time) return "";
      const date = new Date(time);
      if (isNaN(date.getTime())) return "";
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    setSelectedAttendance(attendance);
    setEditForm({
      status: attendance.status || "",
      workReport: attendance.workReport || "",
      inTime: attendance.inTime?.time
        ? formatExistingTime(attendance.inTime.time)
        : "",
      outTime: attendance.outTime?.time
        ? formatExistingTime(attendance.outTime.time)
        : "",
    });
    setShowEditModal(true);
  };

  const handleCreateClick = (date, dayData) => {
    const checkDate = new Date(date);
    if (checkDate.getDay() === 0) {
      showAlert(
        "warning",
        "Cannot Add",
        "Cannot add attendance on Sunday (Holiday)",
      );
      return;
    }

    setSelectedDateForCreation({
      date: date,
      day: dayData.day,
      formattedDate: checkDate,
    });
    setCreateForm({
      status: "present",
      workReport: "",
      inTime: "",
      outTime: "",
    });
    setShowCreateModal(true);
  };

  const handleCreateAttendance = async () => {
    if (!createForm.status) {
      showAlert(
        "warning",
        "Missing Information",
        "Please select attendance status",
      );
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Creating...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const createData = {
        teacherId: selectedTeacher._id,
        date: selectedDateForCreation.date,
        status: createForm.status,
        workReport: createForm.workReport || "",
      };

      if (createForm.inTime) {
        const [hours, minutes] = createForm.inTime.split(":");
        const inDateTime = new Date(selectedDateForCreation.date);
        inDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        createData.inTime = { time: inDateTime };
      }

      if (createForm.outTime) {
        const [hours, minutes] = createForm.outTime.split(":");
        const outDateTime = new Date(selectedDateForCreation.date);
        outDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        createData.outTime = { time: outDateTime };
      }

      await attendanceService.createAttendanceByAdmin(createData);
      Swal.close();
      showAlert("success", "Success!", "Attendance created successfully");
      setShowCreateModal(false);
      fetchMonthlyAttendance();
    } catch (error) {
      Swal.close();
      showAlert(
        "error",
        "Failed!",
        error.response?.data?.error || "Failed to create attendance",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    setLoading(true);
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const updateData = {
        status: editForm.status,
        workReport: editForm.workReport,
      };

      const createDateTime = (date, time) => {
        if (!time) return null;
        const [h, m] = time.split(":");
        if (!h || !m) return null;
        const d = new Date(date);
        if (isNaN(d)) return null;
        d.setHours(Number(h), Number(m), 0, 0);
        return isNaN(d) ? null : d;
      };

      const inTime = createDateTime(selectedAttendance?.date, editForm.inTime);
      if (inTime) {
        updateData.inTime = {
          time: inTime,
          location: selectedAttendance.inTime?.location,
        };
      }

      const outTime = createDateTime(
        selectedAttendance?.date,
        editForm.outTime,
      );
      if (outTime) {
        updateData.outTime = {
          time: outTime,
          location: selectedAttendance.outTime?.location,
        };
      }

      await attendanceService.updateAttendanceByAdmin(
        selectedAttendance._id,
        updateData,
      );
      Swal.close();
      showAlert("success", "Success!", "Attendance updated successfully");
      setShowEditModal(false);
      await fetchMonthlyAttendance();
    } catch (error) {
      Swal.close();
      showAlert("error", "Failed!", "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status, isSunday = false, isHoliday = false) => {
    if (isSunday || isHoliday) {
      return {
        bg: colors.secondary, // #E38A0A (orange)
        text: colors.light, // #F7F7F7 (off-white)
        border: colors.secondary,
        icon: <Calendar size={12} style={{ color: colors.primary }} />,
        label: "Holiday",
      };
    }

    switch (status) {
      case "present":
        return {
          bg: colors.primary, // #0B2248 (dark blue)
          text: colors.light, // #F7F7F7 (off-white)
          border: colors.primary,
          icon: <CheckCircle size={12} style={{ color: colors.light }} />,
          label: "P",
        };

      case "absent":
        return {
          bg: colors.accent, // #DB2112 (red)
          text: colors.light, // #F7F7F7 (off-white)
          border: colors.accent,
          icon: <XCircle size={12} style={{ color: colors.light }} />,
          label: "A",
        };

      case "half-day":
        return {
          bg: colors.primary, // #0B2248 (dark blue)
          text: colors.light, // #F7F7F7 (off-white)
          border: colors.primary,
          icon: <Clock size={12} style={{ color: colors.light }} />,
          label: "HD",
        };

      case "leave":
        return {
          bg: colors.secondary, // #E38A0A (orange)
          text: colors.light, // #F7F7F7 (off-white)
          border: colors.secondary,
          icon: <Calendar size={12} style={{ color: colors.light }} />,
          label: "L",
        };

      default:
        return {
          bg: colors.light, // #F7F7F7 (off-white)
          text: colors.primary, // #0B2248 (dark blue)
          border: colors.primary,
          icon: null,
          label: "-",
        };
    }
  };

  const formatLocation = (location) => {
    if (!location) return "No location";
    if (location.address) {
      const addressParts = location.address.split(",");
      if (addressParts.length >= 2) {
        return `${addressParts[0].trim()}, ${addressParts[1].trim()}`;
      }
      return location.address.length > 40
        ? location.address.substring(0, 40) + "..."
        : location.address;
    }
    return `${location.lat?.toFixed(6)}, ${location.lng?.toFixed(6)}`;
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const endYear = currentYear + 2;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  if (loading && !calendarData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: colors.primary }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Attendance Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor and manage staff attendance (Sundays are auto-marked as
          Holiday)
        </p>
      </div>

      {/* Main Tabs */}
      <div
        className="flex flex-wrap gap-2 mb-6 border-b"
        style={{ borderColor: colors.light }}
      >
        <button
          onClick={() => setActiveMainTab("attendance")}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
            activeMainTab === "attendance"
              ? "text-white shadow-lg"
              : "hover:text-white"
          }`}
          style={{
            backgroundColor:
              activeMainTab === "attendance" ? colors.primary : "transparent",
            color: activeMainTab === "attendance" ? "white" : colors.primary,
          }}
          onMouseEnter={(e) => {
            if (activeMainTab !== "attendance") {
              e.currentTarget.style.backgroundColor = colors.secondary;
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (activeMainTab !== "attendance") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.primary;
            }
          }}
        >
          <span className="hidden sm:inline">Attendance Sheet</span>
          <span className="sm:hidden">Attendance</span>
        </button>
        <button
          onClick={() => setActiveMainTab("requests")}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
            activeMainTab === "requests"
              ? "text-white shadow-lg"
              : "hover:text-white"
          }`}
          style={{
            backgroundColor:
              activeMainTab === "requests" ? colors.primary : "transparent",
            color: activeMainTab === "requests" ? "white" : colors.primary,
          }}
          onMouseEnter={(e) => {
            if (activeMainTab !== "requests") {
              e.currentTarget.style.backgroundColor = colors.secondary;
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (activeMainTab !== "requests") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.primary;
            }
          }}
        >
          <span className="hidden sm:inline">Update Requests</span>
          <span className="sm:hidden">Requests</span>
        </button>
        <button
          onClick={() => setActiveMainTab("holidays")}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-t-lg transition-all duration-200 ${
            activeMainTab === "holidays"
              ? "text-white shadow-lg"
              : "hover:text-white"
          }`}
          style={{
            backgroundColor:
              activeMainTab === "holidays" ? colors.primary : "transparent",
            color: activeMainTab === "holidays" ? "white" : colors.primary,
          }}
          onMouseEnter={(e) => {
            if (activeMainTab !== "holidays") {
              e.currentTarget.style.backgroundColor = colors.secondary;
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (activeMainTab !== "holidays") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.primary;
            }
          }}
        >
          <span className="hidden sm:inline">Holidays</span>
          <span className="sm:hidden">Holidays</span>
        </button>
      </div>

      {/* Attendance Sheet Tab */}
      {activeMainTab === "attendance" && (
        <>
          {/* Teacher Selection Dropdown */}
          <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
            <div
              className="px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              style={{ backgroundColor: colors.primary }}
            >
              <h2 className="text-white font-semibold">Select Staff Member</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadSingleTeacherExcel}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download Current</span>
                  <span className="sm:hidden">Download</span>
                </button>
                <button
                  onClick={downloadAllTeachersExcel}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                >
                  <FileSpreadsheet size={16} />
                  <span className="hidden sm:inline">Download All</span>
                  <span className="sm:hidden">All</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              <select
                value={selectedTeacher?._id || ""}
                onChange={(e) => {
                  const teacher = teachers.find(
                    (t) => t._id === e.target.value,
                  );
                  setSelectedTeacher(teacher);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ focusRingColor: colors.primary }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "")}
              >
                <option value="">Select a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.designation}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Section */}
          {selectedTeacher && teacherInfo && (
            <>
              {/* Stats Cards - From Backend */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                <div
                  className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4"
                  style={{ borderColor: colors.primary }}
                >
                  <div
                    className="text-xl md:text-3xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {stats.presentCount || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    Present Days
                  </div>
                </div>
                <div
                  className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4"
                  style={{ borderColor: colors.accent }}
                >
                  <div
                    className="text-xl md:text-3xl font-bold"
                    style={{ color: colors.accent }}
                  >
                    {stats.absentCount || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    Absent Days
                  </div>
                </div>
                <div
                  className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4"
                  style={{ borderColor: colors.secondary }}
                >
                  <div
                    className="text-xl md:text-3xl font-bold"
                    style={{ color: colors.secondary }}
                  >
                    {stats.halfDayCount || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    Half Days
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-blue-500">
                  <div className="text-xl md:text-3xl font-bold text-blue-500">
                    {stats.leaveCount || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    Leave Days
                  </div>
                </div>
                <div
                  className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4"
                  style={{ borderColor: colors.primary }}
                >
                  <div
                    className="text-xl md:text-3xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {stats.presentPercentage || 0}%
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    Attendance Rate
                  </div>
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.presentPercentage || 0}%`,
                        backgroundColor: colors.primary,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                      className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                      style={{ focusRingColor: colors.primary }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "")}
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month.substring(0, 3)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                      style={{ focusRingColor: colors.primary }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "")}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("calendar")}
                      className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all ${viewMode === "calendar" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      style={
                        viewMode === "calendar"
                          ? { backgroundColor: colors.primary }
                          : {}
                      }
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all ${viewMode === "list" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      style={
                        viewMode === "list"
                          ? { backgroundColor: colors.primary }
                          : {}
                      }
                    >
                      List
                    </button>
                    <button
                      onClick={fetchMonthlyAttendance}
                      className="px-2 md:px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      style={{ color: colors.primary }}
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex justify-center py-12">
                  <Loader
                    className="w-8 h-8 animate-spin"
                    style={{ color: colors.primary }}
                  />
                </div>
              )}

              {/* Calendar View */}
              {!loading && viewMode === "calendar" && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div
                    className="px-4 py-2"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <h2 className="text-white font-semibold text-center text-sm md:text-base">
                      {months[selectedMonth - 1]} {selectedYear}
                    </h2>
                  </div>
                  <div className="overflow-x-auto p-2">
                    <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1">
                      {weekdays.map((day) => (
                        <div
                          key={day}
                          className="text-center py-1 text-[10px] md:text-xs font-semibold bg-gray-100 rounded-md"
                          style={{ color: colors.primary }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="min-h-15 md:min-h-20 bg-gray-50 rounded-md"
                        ></div>
                      ))}
                      {calendarData.map((day, idx) => {
                        const isSunday = day.isSunday;
                        const isHoliday = day.isHoliday || false;
                        const style = getStatusStyle(
                          day.attendance?.status,
                          isSunday,
                          isHoliday,
                        );
                        const isHovered = hoveredCell === idx;
                        const hasAttendance = !!day.attendance;
                        const isEditable = !isSunday && !isHoliday;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredCell(idx)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => {
                              if (!isEditable) {
                                if (isSunday)
                                  showAlert(
                                    "warning",
                                    "Cannot Edit",
                                    "Sunday is a holiday. Cannot modify attendance.",
                                  );
                                else if (isHoliday)
                                  showAlert(
                                    "warning",
                                    "Cannot Edit",
                                    "This day is a holiday. Cannot modify attendance.",
                                  );
                                return;
                              }
                              if (hasAttendance) {
                                handleEditClick(day.attendance);
                              } else {
                                handleCreateClick(day.date, day);
                              }
                            }}
                            className={`min-h-10 md:min-h-20 p-1 md:p-1.5 rounded-md border transition-all`}
                          >
                            <div className="text-xs md:text-sm font-medium flex justify-between items-center">
                              <span>{day.day}</span>
                              {(isSunday || isHoliday) && (
                                <Calendar
                                  size={10}
                                  style={{ color: colors.secondary }}
                                />
                              )}
                              {!isSunday && !isHoliday && !hasAttendance && (
                                <Plus
                                  size={10}
                                  className="opacity-50"
                                  style={{ color: colors.primary }}
                                />
                              )}
                            </div>
                            {isSunday || isHoliday ? (
                              <div className="mt-1 text-center">
                                <div
                                  className="text-[9px] md:text-xs flex items-center justify-center gap-0.5"
                                  style={{ color: colors.secondary }}
                                >
                                  <span>Holiday</span>
                                </div>
                              </div>
                            ) : hasAttendance ? (
                              <div className="mt-1">
                                <div
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] md:text-xs font-medium`}
                                  style={{
                                    backgroundColor: style?.bg,
                                    color: style?.text,
                                  }}
                                >
                                  <span>{style?.label}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 text-[9px] md:text-xs text-gray-400 text-center hidden sm:block">
                                Click
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* List View */}
              {!loading && viewMode === "list" && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead
                        className="text-white sticky top-0"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <tr>
                          <th className="py-2 px-2 md:px-3 text-left">Date</th>
                          <th className="py-2 px-2 md:px-3 text-left hidden sm:table-cell">
                            Day
                          </th>
                          <th className="py-2 px-2 md:px-3 text-left">
                            Status
                          </th>
                          <th className="py-2 px-2 md:px-3 text-left hidden md:table-cell">
                            In Time
                          </th>
                          <th className="py-2 px-2 md:px-3 text-left hidden md:table-cell">
                            Out Time
                          </th>
                          <th className="py-2 px-2 md:px-3 text-left hidden lg:table-cell">
                            Work Report
                          </th>
                          <th className="py-2 px-2 md:px-3 text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {calendarData.map((day, idx) => {
                          const isSunday = day.isSunday;
                          const isHoliday = day.isHoliday || false;
                          const style = getStatusStyle(
                            day.attendance?.status,
                            isSunday,
                            isHoliday,
                          );
                          const weekdaysList = [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ];
                          const weekdayName =
                            weekdaysList[
                              new Date(
                                selectedYear,
                                selectedMonth - 1,
                                day.day,
                              ).getDay()
                            ];
                          return (
                            <tr
                              key={idx}
                              className={`border-b transition-colors ${isSunday || isHoliday ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-[#EADDCD]/30"}`}
                            >
                              <td className="py-2 px-2 md:px-3">
                                <span className="font-medium text-gray-800">
                                  {day.day}
                                </span>
                                <div className="text-xs text-gray-400 sm:hidden">
                                  {weekdayName.substring(0, 3)}
                                </div>
                              </td>
                              <td className="py-2 px-2 md:px-3 hidden sm:table-cell">
                                <span
                                  className={`text-sm ${isSunday ? "text-red-500 font-semibold" : "text-gray-600"}`}
                                >
                                  {weekdayName}
                                </span>
                              </td>
                              <td className="py-2 px-2 md:px-3">
                                {isSunday || isHoliday ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                                    style={{
                                      backgroundColor: style?.bg,
                                      color: style?.text,
                                    }}
                                  >
                                    <Calendar size={12} />{" "}
                                    <span className="hidden xs:inline">
                                      Holiday
                                    </span>
                                  </span>
                                ) : day.attendance ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
                                    style={{
                                      backgroundColor: style?.bg,
                                      color: style?.text,
                                    }}
                                  >
                                    <span className="capitalize">
                                      {style?.label === "P"
                                        ? "Present"
                                        : style?.label === "A"
                                          ? "Absent"
                                          : style?.label === "HD"
                                            ? "Half Day"
                                            : style?.label === "L"
                                              ? "Leave"
                                              : style?.label}
                                    </span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleCreateClick(day.date, day)
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50"
                                    style={{ color: colors.primary }}
                                  >
                                    <Plus size={12} />
                                    <span className="hidden xs:inline">
                                      Add
                                    </span>
                                  </button>
                                )}
                              </td>
                              <td className="py-2 px-2 md:px-3 hidden md:table-cell">
                                {!isSunday &&
                                !isHoliday &&
                                day.attendance?.inTime
                                  ? new Date(
                                      day.attendance.inTime.time,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </td>
                              <td className="py-2 px-2 md:px-3 hidden md:table-cell">
                                {!isSunday &&
                                !isHoliday &&
                                day.attendance?.outTime
                                  ? new Date(
                                      day.attendance.outTime.time,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </td>
                              <td className="py-2 px-2 md:px-3 hidden lg:table-cell text-gray-500 max-w-[150px] truncate">
                                {!isSunday &&
                                !isHoliday &&
                                day.attendance?.workReport
                                  ? day.attendance.workReport.substring(0, 30)
                                  : "-"}
                              </td>
                              <td className="py-2 px-2 md:px-3 text-center">
                                {!isSunday && !isHoliday && day.attendance && (
                                  <button
                                    onClick={() =>
                                      handleEditClick(day.attendance)
                                    }
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: colors.primary }}
                                  >
                                    <Edit size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {calendarData.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar
                          size={48}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p>No attendance records found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Update Requests Tab */}
      {activeMainTab === "requests" && <UpdateRequestsTab colors={colors} />}

      {/* Holidays Tab */}
      {activeMainTab === "holidays" && <HolidayManagement colors={colors} />}

      {/* Edit Modal */}
      {showEditModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div
              className="px-4 py-3 flex justify-between items-center sticky top-0"
              style={{ backgroundColor: colors.primary }}
            >
              <h3 className="text-white font-semibold">Edit Attendance</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                >
                  <option value="">Select Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Report
                </label>
                <textarea
                  value={editForm.workReport}
                  onChange={(e) =>
                    setEditForm({ ...editForm, workReport: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                  placeholder="Enter work report..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In Time
                  </label>
                  <input
                    type="time"
                    value={editForm.inTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, inTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {/* {selectedAttendance.inTime?.time && (
                    <p className="text-xs text-gray-400 mt-1">
                      Current:{" "}
                      {new Date(
                        selectedAttendance.inTime.time,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Out Time
                  </label>
                  <input
                    type="time"
                    value={editForm.outTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, outTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {/* {selectedAttendance.outTime?.time && (
                    <p className="text-xs text-gray-400 mt-1">
                      Current:{" "}
                      {new Date(
                        selectedAttendance.outTime.time,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )} */}
                </div>
              </div>

              {/* In-Time Location */}
              {selectedAttendance.inTime?.location && (
                <div
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: colors.light }}
                >
                  <p
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: colors.primary }}
                  >
                    <MapPin size={16} />
                    Check-In Location
                  </p>

                  <p className="text-sm text-gray-700 break-words leading-6">
                    {selectedAttendance.inTime.location.address ||
                      "Location not available"}
                  </p>
                </div>
              )}

              {/* Out-Time Location */}

              {selectedAttendance.outTime?.location && (
                <div
                  className="p-4 rounded-xl border mt-3"
                  style={{ backgroundColor: colors.light }}
                >
                  <p
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: colors.primary }}
                  >
                    <MapPin size={16} />
                    Check-Out Location
                  </p>

                  <p className="text-sm text-gray-700 break-words leading-6">
                    {selectedAttendance.outTime.location.address ||
                      "Location not available"}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateAttendance}
                  disabled={loading}
                  className="flex-1 text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Attendance Modal */}
      {showCreateModal && selectedDateForCreation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div
              className="px-4 py-3 flex justify-between items-center sticky top-0"
              style={{ backgroundColor: colors.primary }}
            >
              <h3 className="text-white font-semibold">Add Attendance</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={new Date(
                    selectedDateForCreation.date,
                  ).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span style={{ color: colors.accent }}>*</span>
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Report
                </label>
                <textarea
                  value={createForm.workReport}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, workReport: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                  placeholder="Enter work report..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={createForm.inTime}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, inTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Out Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={createForm.outTime}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, outTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateAttendance}
                  disabled={loading}
                  className="flex-1 text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Plus size={16} />
                  )}
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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

export default AttendanceManagement;
