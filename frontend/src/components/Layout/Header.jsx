// import React, { useState, useRef, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext.jsx";
// import { Link, useNavigate } from "react-router-dom";
// import { assets } from "../../assets/assets.js";
// import teacherService from "../../services/teacherService.js";

// const Header = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);

//   // Fetch teacher profile photo if user is teacher
//   useEffect(() => {
//     const fetchProfilePhoto = async () => {
//       if (user?.role === 'teacher' && user?.profileCompleted) {
//         try {
//           const data = await teacherService.getMyProfile();
//           if (data?.data?.profile?.photo?.url) {
//             setProfilePhoto(data.data.profile.photo.url);
//           }
//         } catch (error) {
//           console.error('Error fetching profile photo:', error);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     };

//     fetchProfilePhoto();
//   }, [user]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setShowProfileMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const getInitials = (name) => {
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const handleProfileClick = () => {
//     setShowProfileMenu(false);
//     if (user?.role === "admin") {
//       navigate("/admin/profile");
//     } else {
//       navigate("/teacher/profile");
//     }
//   };

//   const handleLogout = () => {
//     setShowProfileMenu(false);
//     logout();
//     navigate("/login");
//   };

//   return (
//     <header className="bg-white shadow-md border-b border-[#EADDCD] fixed top-0 left-0 right-0 z-30">
//       <div className="flex items-center justify-between px-4 md:px-6 py-3">
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline shrink-0">
//           {/* Logo Image */}
//           <div className="w-8 h-8 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-md bg-[#EADDCD] shrink-0">
//             <img
//               src={assets.logo}
//               alt="School Logo"
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* Text - Hide on very small screens */}
//           <div className="hidden sm:block">
//             <div className="leading-tight mb-0.5">
//               <span className="text-sm md:text-[19px] font-extrabold text-[#F5C78B] font-[Nunito] tracking-tight">
//                 Shree Ram
//               </span>{" "}
//               <span className="text-sm md:text-[19px] font-extrabold text-[#0D5166] font-[Nunito] tracking-tight">
//                 Public School
//               </span>
//             </div>

//             <div className="text-[8px] md:text-[10.5px] font-bold text-[#0D5166] tracking-wide flex items-center gap-1">
//               <span className="w-0.75 h-0.75 md:w-1.25 md:h-1.25 rounded-full bg-[#0D5166] inline-block"></span>
//               Affiliated to CBSE
//             </div>
//           </div>
//         </Link>

//         {/* Profile Section */}
//         <div className="relative" ref={menuRef}>
//           <button
//             onClick={() => setShowProfileMenu(!showProfileMenu)}
//             className="flex items-center space-x-2 md:space-x-3 focus:outline-none"
//           >
//             <div className="w-8 h-8 md:w-10 md:h-10 bg-[#EADDCD] rounded-full flex items-center justify-center border border-[#0D5166] overflow-hidden">
//               {profilePhoto ? (
//                 <img
//                   src={profilePhoto}
//                   alt="Profile"
//                   className="w-full h-full rounded-full object-cover"
//                 />
//               ) : (
//                 <span className="text-[#0D5166] font-semibold text-xs md:text-sm">
//                   {!loading && getInitials(user?.name || "User")}
//                 </span>
//               )}
//             </div>
//           </button>

//           {/* Dropdown Menu */}
//           {showProfileMenu && (
//             <div className="absolute right-0 mt-2 w-56 md:w-60 bg-white border border-[#EADDCD] rounded-lg shadow-lg py-2 z-20">
//               {/* Profile Header with Photo */}
//               <div className="px-4 py-3 border-b border-[#EADDCD] flex items-center gap-3">
//                 <div className="w-10 h-10 bg-[#EADDCD] rounded-full flex items-center justify-center border border-[#0D5166] overflow-hidden">
//                   {profilePhoto ? (
//                     <img
//                       src={profilePhoto}
//                       alt="Profile"
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-[#0D5166] font-semibold text-sm">
//                       {!loading && getInitials(user?.name || "User")}
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-[#0D5166] truncate">
//                     {user?.name}
//                   </p>
//                   <p className="text-xs text-[#0D5166]/70 truncate">{user?.email}</p>
//                 </div>
//               </div>

//               {/* Profile Link */}
//               <button
//                 onClick={handleProfileClick}
//                 className="w-full text-left px-4 py-2 text-sm text-[#0D5166] hover:bg-[#EADDCD] transition-colors flex items-center gap-2"
//               >
//                 <UserIcon />
//                 My Profile
//               </button>

//               {/* Logout Button */}
//               <button
//                 onClick={handleLogout}
//                 className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#EADDCD] transition-colors flex items-center gap-2 border-t border-[#EADDCD] mt-1"
//               >
//                 <LogoutIcon />
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// // Icon components for cleaner code
// const UserIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//   </svg>
// );

// const LogoutIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//   </svg>
// );

// export default Header;



import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets.js";
import teacherService from "../../services/teacherService.js";
import adminService from "../../services/adminService.js";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch profile photo based on user role
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (user?.role === 'teacher' && user?.profileCompleted) {
          const data = await teacherService.getMyProfile();
          if (data?.data?.profile?.photo?.url) {
            setProfilePhoto(data.data.profile.photo.url);
          }
        } else if (user?.role === 'admin') {
          const data = await adminService.getAdminProfile();
          if (data?.data?.adminProfile?.photo?.url) {
            setProfilePhoto(data.data.adminProfile.photo.url);
          }
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePhoto();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    if (user?.role === "admin") {
      navigate("/admin/profile");
    } else {
      navigate("/teacher/profile");
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md border-b border-[#EADDCD] fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline shrink-0">
          {/* Logo Image */}
          <div className="w-8 h-8 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-md bg-[#EADDCD] shrink-0">
            <img
              src={assets.logo}
              alt="School Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text - Hide on very small screens */}
          <div className="hidden sm:block">
            <div className="leading-tight mb-0.5">
              <span className="text-sm md:text-[19px] font-extrabold text-[#F5C78B] font-[Nunito] tracking-tight">
                Shree Ram
              </span>{" "}
              <span className="text-sm md:text-[19px] font-extrabold text-[#0D5166] font-[Nunito] tracking-tight">
                Public School
              </span>
            </div>

            <div className="text-[8px] md:text-[10.5px] font-bold text-[#0D5166] tracking-wide flex items-center gap-1">
              <span className="w-0.75 h-0.75 md:w-1.25 md:h-1.25 rounded-full bg-[#0D5166] inline-block"></span>
              Affiliated to CBSE
            </div>
          </div>
        </Link>

        {/* Profile Section */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 md:space-x-3 focus:outline-none"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#EADDCD] rounded-full flex items-center justify-center border border-[#0D5166] overflow-hidden">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-[#0D5166] font-semibold text-xs md:text-sm">
                  {!loading && getInitials(user?.name || "User")}
                </span>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 md:w-60 bg-white border border-[#EADDCD] rounded-lg shadow-lg py-2 z-20">
              {/* Profile Header with Photo */}
              <div className="px-4 py-3 border-b border-[#EADDCD] flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EADDCD] rounded-full flex items-center justify-center border border-[#0D5166] overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[#0D5166] font-semibold text-sm">
                      {!loading && getInitials(user?.name || "User")}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0D5166] truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#0D5166]/70 truncate">{user?.email}</p>
                  <p className="text-xs text-[#F5C78B] mt-0.5 capitalize">{user?.role}</p>
                </div>
              </div>

              {/* Profile Link */}
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2 text-sm text-[#0D5166] hover:bg-[#EADDCD] transition-colors flex items-center gap-2"
              >
                <UserIcon />
                My Profile
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#EADDCD] transition-colors flex items-center gap-2 border-t border-[#EADDCD] mt-1"
              >
                <LogoutIcon />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Icon components for cleaner code
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default Header;