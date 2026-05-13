// import React, { useState } from "react";
// import {
//   UserPlus,
//   Lock,
//   Key,
//   Eye,
//   EyeOff,
//   Shield,
//   XCircle,
// } from "lucide-react";
// import Swal from "sweetalert2";
// import adminService from "../../services/adminService.js";

// const CreateStaffTab = ({ loading, onSuccess, setToast }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     designation: "",
//     password: "",
//   });
//   const [localLoading, setLocalLoading] = useState(false);

//   const handleCreateTeacher = async (e) => {
//     e.preventDefault();

//     if (formData.password.length < 8) {
//       Swal.fire({
//         icon: "warning",
//         title: "Invalid Password",
//         text: "Password must be at least 8 characters",
//         confirmButtonColor: "#0D5166",
//       });
//       return;
//     }

//     setLocalLoading(true);
//     try {
//       await adminService.createTeacher({
//         name: formData.name,
//         email: formData.email,
//         designation: formData.designation,
//         password: formData.password,
//       });
//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Teacher created successfully",
//         timer: 2000,
//         showConfirmButton: false,
//         position: "top-end",
//         toast: true,
//       });
//       setFormData({
//         name: "",
//         email: "",
//         designation: "",
//         password: "",
//       });
//       onSuccess();
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error!",
//         text: error.response?.data?.error || "Failed to create teacher",
//         confirmButtonColor: "#0D5166",
//       });
//     } finally {
//       setLocalLoading(false);
//     }
//   };

//   return (
//     <div className="">
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-[#0D5166] to-[#1a6f8a] px-6 py-4">
//           <h2 className="text-xl font-semibold text-white">
//             Create New Teacher
//           </h2>
//           <p className="text-[#F5C78B] text-sm">
//             Fill in the details to create a teacher account
//           </p>
//         </div>

//         <form onSubmit={handleCreateTeacher} className="p-6">
//           <div className="grid grid-cols-12 gap-5">
//             <div className="col-span-12 md:col-span-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Full Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
//                 placeholder="Enter full name"
//               />
//             </div>

//             <div className="col-span-12 md:col-span-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Email Address <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
//                 placeholder="teacher@example.com"
//               />
//             </div>

//             <div className="col-span-12 md:col-span-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Designation <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.designation}
//                 onChange={(e) =>
//                   setFormData({ ...formData, designation: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
//                 placeholder="e.g., Mathematics Teacher"
//               />
//             </div>

//             <div className="col-span-12 md:col-span-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Password <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Lock
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   size={18}
//                 />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   required
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
//                   placeholder="Enter password (min 6 characters)"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166] transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>
//           </div>
//           <button
//             type="submit"
//             disabled={loading || localLoading}
//             className="w-full mt-4 bg-[#0D5166] text-white py-3 rounded-lg font-semibold hover:bg-[#0a3d4f] transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             {loading || localLoading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Creating...
//               </>
//             ) : (
//               <>
//                 <UserPlus size={18} />
//                 Create Teacher
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateStaffTab;

import React, { useState } from "react";
import {
  UserPlus,
  Lock,
  Key,
  Eye,
  EyeOff,
  Shield,
  XCircle,
  Loader,
} from "lucide-react";
import Swal from "sweetalert2";
import adminService from "../../../services/adminService.js";

const CreateStaffTab = ({ loading, onSuccess, setToast }) => {
  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7",
  };

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    password: "",
  });
  const [localLoading, setLocalLoading] = useState(false);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be at least 8 characters",
        confirmButtonColor: colors.primary,
      });
      return;
    }

    setLocalLoading(true);
    try {
      await adminService.createTeacher({
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        password: formData.password,
      });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Teacher created successfully",
        position: "center",
        showConfirmButton: false,
        timer: 2000,
        backdrop: true,
        allowOutsideClick: false,
      });
      setFormData({
        name: "",
        email: "",
        designation: "",
        password: "",
      });
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.error || "Failed to create teacher",
        confirmButtonColor: colors.primary,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading && !localLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader
              className="w-12 h-12 animate-spin mx-auto mb-4"
              style={{ color: colors.primary }}
            />
            <p style={{ color: colors.primary }}>Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: colors.primary }}>
          <h2 className="text-xl font-semibold text-white">
            Create New Teacher
          </h2>
          <p className="text-sm" style={{ color: colors.secondary }}>
            Fill in the details to create a teacher account
          </p>
        </div>

        <form onSubmit={handleCreateTeacher} className="p-6">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span style={{ color: colors.accent }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ focusRingColor: colors.primary }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "")}
                placeholder="Enter full name"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span style={{ color: colors.accent }}>*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ focusRingColor: colors.primary }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "")}
                placeholder="teacher@example.com"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Designation <span style={{ color: colors.accent }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ focusRingColor: colors.primary }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "")}
                placeholder="e.g., Mathematics Teacher"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span style={{ color: colors.accent }}>*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                  placeholder="Enter password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: colors.primary }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || localLoading}
            className="w-full mt-6 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
          >
            {loading || localLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Teacher
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStaffTab;
