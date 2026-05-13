import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Clock,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ userRole, isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  // Check screen size and setup
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setIsOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isOpen) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isOpen) {
      setIsHovered(false);
    }
  };

  const adminMenuItems = [
    {
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      badge: null,
    },
    {
      path: "/admin/staff",
      icon: Users,
      label: "Staff Management",
      badge: null,
    },
    {
      path: "/admin/attendance",
      icon: CalendarCheck,
      label: "Attendance Management",
      badge: null,
    },
    {
      path: "/admin/leaves",
      icon: FileText,
      label: "Leave Management",
    },
  ];

  const teacherMenuItems = [
    {
      path: "/teacher/attendance",
      icon: Clock,
      label: "Attendance Management",
      badge: null,
    },
    {
      path: "/teacher/leaves",
      icon: FileText,
      label: "Leave Management",
      badge: null,
    },
  ];

  const bottomMenuItems = [
    {
      path: userRole === "admin" ? "/admin/profile" : "/teacher/profile",
      icon: User,
      label: "My Profile",
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : teacherMenuItems;

  const handleLogout = () => {
    logout();
    if (isMobile) setIsOpen(false);
  };

  const sidebarWidth = isOpen ? "w-64" : "w-20";

  // Show arrow button when sidebar is closed on desktop
  const showDesktopArrowButton = !isMobile && !isOpen;

  // Show arrow button when sidebar is open on mobile (to close it)
  const showMobileArrowButton = isMobile && isOpen;

  return (
    <>
      {/* Desktop Arrow Button - Show when sidebar is closed */}
      {showDesktopArrowButton && (
        <button
          onClick={toggleSidebar}
          className="fixed top-16.25 left-15 z-50 bg-[#0D5166] text-white p-1.5 rounded-lg shadow-lg hover:bg-[#0a3d4f] transition-all duration-200 hidden lg:flex items-center justify-center"
          aria-label="Expand Sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Mobile Arrow Button - Show when sidebar is open on mobile */}
      {showMobileArrowButton && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-16.25 left-60 z-50 bg-[#0D5166] text-white p-1.5 rounded-lg shadow-lg hover:bg-[#0a3d4f] transition-all duration-200"
          aria-label="Close Menu"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Mobile Arrow Button - Show when sidebar is closed on mobile (right side) */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-20 -left-1.75 z-50 bg-[#0D5166] text-white p-1.5 rounded-lg shadow-lg hover:bg-[#0a3d4f] transition-all duration-200"
          aria-label="Open Menu"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Sidebar Overlay for mobile */}
      {isOpen && isMobile && <div onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 h-full bg-white shadow-xl z-20 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarWidth}
          ${
            isMobile
              ? isOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Collapse Arrow Button inside sidebar - Desktop only when open */}
        {!isMobile && isOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-4.5 bg-[#0D5166] text-white p-1.5 rounded-full shadow-lg hover:bg-[#0a3d4f] transition-all duration-200 z-50"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 mt-6 px-3 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive }) => `
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-[#E38A0A] text-[#0B2248] shadow-sm"
                      : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
                  }
                  ${isOpen || isHovered ? "justify-start" : "justify-center"}
                `}
                title={!isOpen ? item.label : ""}
              >
                <item.icon size={20} className="shrink-0" />
                {isOpen && (
                  <>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto">
          {/* Profile Link */}
          <div className="p-3">
            {bottomMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#E38A0A] text-[#0B2248]"
                      : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
                  }
                  ${isOpen || isHovered ? "justify-start" : "justify-center"}
                `}
                title={!isOpen ? item.label : ""}
              >
                <item.icon size={20} className="shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-3 border-t border-[#EADDCD]">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                text-red-600 hover:bg-red-50 hover:text-red-700 group
                ${isOpen || isHovered ? "justify-start" : "justify-center"}
              `}
              title={!(isOpen || isHovered) ? "Logout" : ""}
            >
              <LogOut size={20} className="shrink-0" />
              {(isOpen || isHovered) && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
