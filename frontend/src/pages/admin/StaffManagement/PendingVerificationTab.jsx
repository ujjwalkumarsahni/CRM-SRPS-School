// import React, { useState } from 'react';
// import { Eye, CheckCircle, XCircle, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

// const PendingVerificationTab = ({ 
//   teachers, loading, onViewDetails, onVerify, onReject, onRefresh 
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [rejectReason, setRejectReason] = useState('');
//   const [selectedTeacher, setSelectedTeacher] = useState(null);

//   const pendingTeachers = teachers.filter(t => !t.isVerified && t.profileCompleted);

//   const filteredTeachers = pendingTeachers.filter(teacher => {
//     return teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

//   const handleRejectClick = (teacher) => {
//     setSelectedTeacher(teacher);
//     setShowRejectModal(true);
//   };

//   const handleConfirmReject = async () => {
//     if (await onReject(selectedTeacher._id, rejectReason)) {
//       setShowRejectModal(false);
//       setRejectReason('');
//       setSelectedTeacher(null);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//       <div className="p-4 bg-linear-to-r from-[#0D5166] to-[#1a6f8a] text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="font-semibold text-lg">Pending Verification Requests</h3>
//             <p className="text-sm text-orange-100">Teachers waiting for account verification</p>
//           </div>
//           <div className="bg-white/20 rounded-lg px-3 py-1">
//             <span className="font-bold text-xl">{pendingTeachers.length}</span>
//             <span className="text-sm ml-1">Pending</span>
//           </div>
//         </div>
//       </div>

//       {/* Filters Bar */}
//       <div className="p-4 border-b border-[#EADDCD] bg-gray-50">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search by name, email or designation..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
//             />
//           </div>
          
//           <button
//             onClick={onRefresh}
//             className="flex items-center gap-2 px-4 py-2 bg-[#0D5166] text-white rounded-lg hover:bg-[#0a3d4f] transition-colors"
//           >
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>
      
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left py-3 px-4">S.No</th>
//               <th className="text-left py-3 px-4">Name</th>
//               <th className="text-left py-3 px-4">Email</th>
//               <th className="text-left py-3 px-4">Designation</th>
//               <th className="text-left py-3 px-4">Profile</th>
//               <th className="text-left py-3 px-4">Submitted On</th>
//               <th className="text-left py-3 px-4">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="7" className="text-center py-8">
//                   <div className="flex justify-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div>
//                   </div>
//                 </td>
//               </tr>
//             ) : currentItems.length === 0 ? (
//               <tr>
//                 <td colSpan="7" className="text-center py-8 text-gray-500">
//                   <div className="flex flex-col items-center gap-2">
//                     <CheckCircle size={48} className="text-green-500" />
//                     <p>No pending verification requests</p>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               currentItems.map((teacher, index) => (
//                 <tr key={teacher._id} className="border-b hover:bg-gray-50 transition-colors">
//                   <td className="py-3 px-4 text-gray-600">{indexOfFirstItem + index + 1}</td>
//                   <td className="py-3 px-4 font-medium text-gray-800">{teacher.name}</td>
//                   <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
//                   <td className="py-3 px-4 text-gray-600">{teacher.designation}</td>
//                   <td className="py-3 px-4">
//                     <button
//                       onClick={() => onViewDetails(teacher)}
//                       className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
//                     >
//                       <Eye size={14} /> View Profile
//                     </button>
//                   </td>
//                   <td className="py-3 px-4 text-gray-600">
//                     {new Date(teacher.createdAt).toLocaleDateString('en-GB')}
//                   </td>
//                   <td className="py-3 px-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => onVerify(teacher._id)}
//                         className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
//                       >
//                         <CheckCircle size={14} /> Verify
//                       </button>
//                       <button
//                         onClick={() => handleRejectClick(teacher)}
//                         className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 text-sm"
//                       >
//                         <XCircle size={14} /> Reject
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="px-4 py-3 border-t border-[#EADDCD] flex items-center justify-between">
//           <div className="text-sm text-gray-500">
//             Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length} entries
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronLeft size={18} />
//             </button>
//             <div className="flex gap-1">
//               {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                 let pageNum;
//                 if (totalPages <= 5) {
//                   pageNum = i + 1;
//                 } else if (currentPage <= 3) {
//                   pageNum = i + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNum = totalPages - 4 + i;
//                 } else {
//                   pageNum = currentPage - 2 + i;
//                 }
//                 return (
//                   <button
//                     key={pageNum}
//                     onClick={() => setCurrentPage(pageNum)}
//                     className={`px-3 py-1 rounded-lg transition-colors ${
//                       currentPage === pageNum
//                         ? 'bg-[#0D5166] text-white'
//                         : 'border border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     {pageNum}
//                   </button>
//                 );
//               })}
//             </div>
//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronRight size={18} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Reject Modal */}
//       {showRejectModal && selectedTeacher && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
//             <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
//               <h3 className="text-xl font-semibold text-white">Reject Teacher Application</h3>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-700 mb-4">
//                 Are you sure you want to reject <strong>{selectedTeacher.name}</strong>'s application?
//               </p>
//               <div className="mb-4">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Reason for Rejection <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   value={rejectReason}
//                   onChange={(e) => setRejectReason(e.target.value)}
//                   rows="3"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//                   placeholder="Please provide a reason for rejection..."
//                 />
//               </div>
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleConfirmReject}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Reject
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowRejectModal(false);
//                     setRejectReason('');
//                     setSelectedTeacher(null);
//                   }}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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

// export default PendingVerificationTab;


import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Loader } from 'lucide-react';

const PendingVerificationTab = ({ 
  teachers, loading, onViewDetails, onVerify, onReject, onRefresh 
}) => {
  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7"
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const pendingTeachers = teachers.filter(t => !t.isVerified && t.profileCompleted);

  const filteredTeachers = pendingTeachers.filter(teacher => {
    return teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const handleRejectClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (await onReject(selectedTeacher._id, rejectReason)) {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTeacher(null);
    }
  };

  if (loading && pendingTeachers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4" style={{ backgroundColor: colors.primary }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white">Pending Verification Requests</h3>
            <p className="text-sm" style={{ color: colors.light }}>Teachers waiting for account verification</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="font-bold text-xl text-white">{pendingTeachers.length}</span>
            <span className="text-sm ml-1 text-white">Pending</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border-b" style={{ borderColor: colors.light, backgroundColor: colors.light }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or designation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ focusRingColor: colors.primary }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: colors.secondary }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: colors.light }}>
            <tr>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>S.No</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Name</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Email</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Designation</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Profile</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Submitted On</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.primary }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                  </div>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={48} style={{ color: colors.secondary }} />
                    <p>No pending verification requests</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((teacher, index) => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: colors.light }}>
                  <td className="py-3 px-4 text-gray-600">{indexOfFirstItem + index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{teacher.name}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.designation}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onViewDetails(teacher)}
                      className="transition-colors flex items-center gap-1 hover:opacity-80"
                      style={{ color: colors.primary }}
                    >
                      <Eye size={14} /> View Profile
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(teacher.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVerify(teacher._id)}
                        className="text-white px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-90 flex items-center gap-1 text-sm"
                        style={{ backgroundColor: '#10b981' }}
                      >
                        <CheckCircle size={14} /> Verify
                      </button>
                      <button
                        onClick={() => handleRejectClick(teacher)}
                        className="text-white px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-90 flex items-center gap-1 text-sm"
                        style={{ backgroundColor: colors.accent }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: colors.light }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ color: colors.primary }}
              >
                <ChevronLeft size={18} />
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
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ color: colors.primary }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 rounded-t-2xl" style={{ backgroundColor: colors.accent }}>
              <h3 className="text-xl font-semibold text-white">Reject Teacher Application</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject <strong>{selectedTeacher.name}</strong>'s application?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection <span style={{ color: colors.accent }}>*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: colors.accent }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.accent}20`}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 text-white py-2 rounded-lg transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: colors.accent }}
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: colors.light, color: colors.primary }}
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

export default PendingVerificationTab;