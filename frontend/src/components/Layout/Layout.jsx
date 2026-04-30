import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  // Calculate margin based on sidebar state
  const getMarginLeft = () => {
    if (isMobile) return "ml-0";
    if (sidebarOpen) return "lg:ml-64";
    return "lg:ml-20";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar
        userRole={user?.role}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main
        className={`
          transition-all duration-300 pt-16
          ${getMarginLeft()}
        `}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
