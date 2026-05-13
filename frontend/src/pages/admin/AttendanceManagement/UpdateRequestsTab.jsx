// import React, { useState, useEffect } from "react";
// import {
//   CheckCircle,
//   XCircle,
//   Clock,
//   Calendar,
//   Eye,
//   RefreshCw,
//   User as UserIcon,
//   Briefcase,
//   AlertCircle,
//   Mail
// } from "lucide-react";
// import attendanceService from "../../services/attendanceService";
// import Swal from "sweetalert2";

// const UpdateRequestsTab = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [filter, setFilter] = useState("pending");

//   useEffect(() => {
//     fetchRequests();
//   }, [filter]);

//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       let data;
//       if (filter === "pending") {
//         data = await attendanceService.getPendingUpdateRequests();
//       } else {
//         data = await attendanceService.getAllUpdateRequests(filter);
//       }
//       setRequests(data.data || []);
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error!",
//         text: "Failed to fetch update requests",
//         confirmButtonColor: "#0D5166"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProcessRequest = async (request, action) => {
//     const { value: remarks } = await Swal.fire({
//       title: `${action === 'approve' ? 'Approve' : 'Reject'} Request`,
//       html: `
//         <div class="text-left">
//           <p class="mb-3">Are you sure you want to ${action} this attendance update request?</p>
//           <label class="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
//           <textarea id="remarks" class="swal2-textarea" placeholder="Enter remarks..."></textarea>
//         </div>
//       `,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: `Yes, ${action}`,
//       cancelButtonText: "Cancel",
//       confirmButtonColor: action === 'approve' ? "#10b981" : "#ef4444",
//       preConfirm: () => {
//         const remarksText = document.getElementById('remarks').value;
//         return remarksText;
//       }
//     });

//     if (remarks !== undefined) {
//       Swal.fire({
//         title: "Processing...",
//         allowOutsideClick: false,
//         showConfirmButton: false,
//         willOpen: () => { Swal.showLoading(); }
//       });

//       try {
//         if (action === 'approve') {
//           await attendanceService.approveUpdateRequest(request._id, remarks);
//         } else {
//           await attendanceService.rejectUpdateRequest(request._id, remarks);
//         }
        
//         Swal.close();
//         Swal.fire({
//           icon: "success",
//           title: "Success!",
//           text: `Request ${action}ed successfully`,
//           confirmButtonColor: "#0D5166"
//         });
//         fetchRequests();
//         setShowDetailsModal(false);
//       } catch (error) {
//         Swal.close();
//         Swal.fire({
//           icon: "error",
//           title: "Failed!",
//           text: error.response?.data?.error || "Failed to process request",
//           confirmButtonColor: "#0D5166"
//         });
//       }
//     }
//   };

//   const getStatusBadge = (status) => {
//     switch(status) {
//       case 'pending': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock size={14} /> };
//       case 'approved': return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={14} /> };
//       case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle size={14} /> };
//       default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null };
//     }
//   };

//   const formatTime = (time) => {
//     if (!time) return "-";
//     return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString("en-GB", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric"
//     });
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//       <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4">
//         <h2 className="text-white font-semibold text-lg">Attendance Update Requests</h2>
//         <p className="text-[#F5C78B] text-sm">Review and manage teacher update requests</p>
//       </div>

//       <div className="p-4 border-b border-[#EADDCD] bg-gray-50">
//         <div className="flex flex-wrap gap-3 items-center justify-between">
//           <div className="flex gap-3">
//             <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "pending" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>Pending</button>
//             <button onClick={() => setFilter("approved")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "approved" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>Approved</button>
//             <button onClick={() => setFilter("rejected")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "rejected" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>Rejected</button>
//             <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "all" ? "bg-[#0D5166] text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>All</button>
//           </div>
//           <button onClick={fetchRequests} className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"><RefreshCw size={16} /></button>
//         </div>
//       </div>

//       {loading && (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div></div>)}

//       {!loading && requests.length === 0 && (
//         <div className="text-center py-12"><CheckCircle size={48} className="mx-auto text-green-300 mb-3" /><p className="text-gray-500">No update requests found</p></div>
//       )}

//       {!loading && requests.length > 0 && (
//         <div className="divide-y divide-[#EADDCD]">
//           {requests.map((request) => {
//             const statusBadge = getStatusBadge(request.status);
//             const attendance = request.attendance;
//             return (
//               <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-[#0D5166] rounded-full flex items-center justify-center text-white font-bold">{request.teacher?.name?.charAt(0).toUpperCase()}</div>
//                       <div><h3 className="font-semibold text-gray-800">{request.teacher?.name}</h3><p className="text-xs text-gray-500">{request.teacher?.designation}</p></div>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
//                       <div><p className="text-xs text-gray-500">Date</p><p className="font-medium">{attendance ? formatDate(attendance.date) : '-'}</p></div>
//                       <div><p className="text-xs text-gray-500">Current Status</p><p className="font-medium capitalize">{attendance?.status || 'Not marked'}</p></div>
//                       <div><p className="text-xs text-gray-500">Requested Status</p><p className="font-medium capitalize text-[#0D5166]">{request.requestedChanges?.status || '-'}</p></div>
//                       <div><p className="text-xs text-gray-500">Requested On</p><p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p></div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.icon}{request.status.toUpperCase()}</span>
//                     <button onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
//                     {request.status === 'pending' && (<><button onClick={() => handleProcessRequest(request, 'approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle size={18} /></button><button onClick={() => handleProcessRequest(request, 'reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><XCircle size={18} /></button></>)}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Details Modal */}
//       {showDetailsModal && selectedRequest && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4 flex justify-between items-center sticky top-0">
//               <h3 className="text-white font-semibold text-lg">Request Details</h3>
//               <button onClick={() => setShowDetailsModal(false)} className="text-white hover:text-gray-200"><XCircle size={24} /></button>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold text-[#0D5166] mb-3">Teacher Information</h4><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{selectedRequest.teacher?.name}</p></div><div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{selectedRequest.teacher?.email}</p></div><div><p className="text-xs text-gray-500">Designation</p><p className="font-medium">{selectedRequest.teacher?.designation}</p></div><div><p className="text-xs text-gray-500">Request Date</p><p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p></div></div></div>
//               <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold text-[#0D5166] mb-3">Attendance Information</h4><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-gray-500">Date</p><p className="font-medium">{selectedRequest.attendance ? formatDate(selectedRequest.attendance.date) : '-'}</p></div><div><p className="text-xs text-gray-500">Current Status</p><p className="font-medium capitalize">{selectedRequest.attendance?.status || 'Not marked'}</p></div><div><p className="text-xs text-gray-500">Current In-Time</p><p className="font-medium">{selectedRequest.attendance?.inTime?.time ? formatTime(selectedRequest.attendance.inTime.time) : '-'}</p></div><div><p className="text-xs text-gray-500">Current Out-Time</p><p className="font-medium">{selectedRequest.attendance?.outTime?.time ? formatTime(selectedRequest.attendance.outTime.time) : '-'}</p></div></div></div>
//               <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-semibold text-[#0D5166] mb-3">Requested Changes</h4><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-gray-500">Requested Status</p><p className="font-medium capitalize text-blue-700">{selectedRequest.requestedChanges?.status || '-'}</p></div><div><p className="text-xs text-gray-500">Requested Work Report</p><p className="font-medium text-sm">{selectedRequest.requestedChanges?.workReport || '-'}</p></div><div><p className="text-xs text-gray-500">Requested In-Time</p><p className="font-medium">{selectedRequest.requestedChanges?.inTime ? formatTime(selectedRequest.requestedChanges.inTime) : '-'}</p></div><div><p className="text-xs text-gray-500">Requested Out-Time</p><p className="font-medium">{selectedRequest.requestedChanges?.outTime ? formatTime(selectedRequest.requestedChanges.outTime) : '-'}</p></div></div></div>
//               <div className="bg-yellow-50 p-4 rounded-lg"><h4 className="font-semibold text-[#0D5166] mb-2">Reason for Request</h4><p className="text-gray-700">{selectedRequest.reason}</p></div>
//               {selectedRequest.adminRemarks && (<div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold text-[#0D5166] mb-2">Admin Remarks</h4><p className="text-gray-700">{selectedRequest.adminRemarks}</p></div>)}
//               {selectedRequest.status === 'pending' && (<div className="flex gap-3 pt-4"><button onClick={() => { setShowDetailsModal(false); handleProcessRequest(selectedRequest, 'approve'); }} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"><CheckCircle size={18} /> Approve Request</button><button onClick={() => { setShowDetailsModal(false); handleProcessRequest(selectedRequest, 'reject'); }} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"><XCircle size={18} /> Reject Request</button></div>)}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UpdateRequestsTab;

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Eye,
  RefreshCw,
  User as UserIcon,
  Briefcase,
  AlertCircle,
  Mail,
  Loader
} from "lucide-react";
import attendanceService from "../../../services/attendanceService";
import Swal from "sweetalert2";

const UpdateRequestsTab = () => {
  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7"
  };

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (filter === "pending") {
        data = await attendanceService.getPendingUpdateRequests();
      } else {
        data = await attendanceService.getAllUpdateRequests(filter);
      }
      setRequests(data.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch update requests",
        confirmButtonColor: colors.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (request, action) => {
    const { value: remarks } = await Swal.fire({
      title: `${action === 'approve' ? 'Approve' : 'Reject'} Request`,
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to ${action} this attendance update request?</p>
          <label class="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
          <textarea id="remarks" class="swal2-textarea" placeholder="Enter remarks..."></textarea>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: action === 'approve' ? "#10b981" : colors.accent,
      cancelButtonColor: "#6c757d",
      reverseButtons: true
    });

    if (remarks !== undefined) {
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => { Swal.showLoading(); }
      });

      try {
        if (action === 'approve') {
          await attendanceService.approveUpdateRequest(request._id, remarks);
        } else {
          await attendanceService.rejectUpdateRequest(request._id, remarks);
        }
        
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Request ${action}ed successfully`,
          confirmButtonColor: colors.primary,
          timer: 2000,
          timerProgressBar: true
        });
        fetchRequests();
        setShowDetailsModal(false);
      } catch (error) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: error.response?.data?.error || "Failed to process request",
          confirmButtonColor: colors.primary
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return { bg: colors.secondary, text: 'white', icon: <Clock size={14} /> };
      case 'approved': return { bg: '#10b981', text: 'white', icon: <CheckCircle size={14} /> };
      case 'rejected': return { bg: colors.accent, text: 'white', icon: <XCircle size={14} /> };
      default: return { bg: '#6c757d', text: 'white', icon: null };
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading && requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
            <p style={{ color: colors.primary }}>Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4" style={{ backgroundColor: colors.primary }}>
        <h2 className="text-white font-semibold text-lg">Attendance Update Requests</h2>
        <p className="text-sm" style={{ color: colors.secondary }}>Review and manage teacher update requests</p>
      </div>

      <div className="p-4 border-b" style={{ borderColor: colors.light, backgroundColor: colors.light }}>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button 
              onClick={() => setFilter("pending")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === "pending" 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              style={filter === "pending" ? { backgroundColor: colors.secondary } : {}}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter("approved")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === "approved" 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              style={filter === "approved" ? { backgroundColor: '#10b981' } : {}}
            >
              Approved
            </button>
            <button 
              onClick={() => setFilter("rejected")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === "rejected" 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              style={filter === "rejected" ? { backgroundColor: colors.accent } : {}}
            >
              Rejected
            </button>
            <button 
              onClick={() => setFilter("all")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === "all" 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              style={filter === "all" ? { backgroundColor: colors.primary } : {}}
            >
              All
            </button>
          </div>
          <button 
            onClick={fetchRequests} 
            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            style={{ color: colors.primary }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle size={48} className="mx-auto mb-3" style={{ color: colors.secondary }} />
          <p className="text-gray-500">No update requests found</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="divide-y" style={{ borderColor: colors.light }}>
          {requests.map((request) => {
            const statusBadge = getStatusBadge(request.status);
            const attendance = request.attendance;
            return (
              <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {request.teacher?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{request.teacher?.name}</h3>
                        <p className="text-xs text-gray-500">{request.teacher?.designation}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{attendance ? formatDate(attendance.date) : '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Status</p>
                        <p className="font-medium capitalize">{attendance?.status || 'Not marked'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Requested Status</p>
                        <p className="font-medium capitalize" style={{ color: colors.primary }}>{request.requestedChanges?.status || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Requested On</p>
                        <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium`}
                      style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                    >
                      {statusBadge.icon}
                      {request.status.toUpperCase()}
                    </span>
                    <button 
                      onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }} 
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                      style={{ color: colors.primary }}
                    >
                      <Eye size={18} />
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleProcessRequest(request, 'approve')} 
                          className="p-2 text-green-600 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleProcessRequest(request, 'reject')} 
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{ color: colors.accent }}
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 flex justify-between items-center sticky top-0" style={{ backgroundColor: colors.primary }}>
              <h3 className="text-white font-semibold text-lg">Request Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Teacher Information */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.light }}>
                <h4 className="font-semibold mb-3" style={{ color: colors.primary }}>Teacher Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedRequest.teacher?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedRequest.teacher?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Designation</p>
                    <p className="font-medium">{selectedRequest.teacher?.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Request Date</p>
                    <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Current Attendance Information */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.light }}>
                <h4 className="font-semibold mb-3" style={{ color: colors.primary }}>Current Attendance Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{selectedRequest.attendance ? formatDate(selectedRequest.attendance.date) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <p className="font-medium capitalize">{selectedRequest.attendance?.status || 'Not marked'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current In-Time</p>
                    <p className="font-medium">{selectedRequest.attendance?.inTime?.time ? formatTime(selectedRequest.attendance.inTime.time) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Out-Time</p>
                    <p className="font-medium">{selectedRequest.attendance?.outTime?.time ? formatTime(selectedRequest.attendance.outTime.time) : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Requested Changes */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.light }}>
                <h4 className="font-semibold mb-3" style={{ color: colors.primary }}>Requested Changes</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Requested Status</p>
                    <p className="font-medium capitalize" style={{ color: colors.primary }}>{selectedRequest.requestedChanges?.status || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested Work Report</p>
                    <p className="font-medium text-sm">{selectedRequest.requestedChanges?.workReport || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested In-Time</p>
                    <p className="font-medium">{selectedRequest.requestedChanges?.inTime ? formatTime(selectedRequest.requestedChanges.inTime) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested Out-Time</p>
                    <p className="font-medium">{selectedRequest.requestedChanges?.outTime ? formatTime(selectedRequest.requestedChanges.outTime) : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Reason for Request */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.light }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>Reason for Request</h4>
                <p className="text-gray-700">{selectedRequest.reason}</p>
              </div>

              {/* Admin Remarks */}
              {selectedRequest.adminRemarks && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.light }}>
                  <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>Admin Remarks</h4>
                  <p className="text-gray-700">{selectedRequest.adminRemarks}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => { setShowDetailsModal(false); handleProcessRequest(selectedRequest, 'approve'); }} 
                    className="flex-1 text-white py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <CheckCircle size={18} /> Approve Request
                  </button>
                  <button 
                    onClick={() => { setShowDetailsModal(false); handleProcessRequest(selectedRequest, 'reject'); }} 
                    className="flex-1 text-white py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <XCircle size={18} /> Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateRequestsTab;