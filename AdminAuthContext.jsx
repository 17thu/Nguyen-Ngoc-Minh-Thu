"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Context lưu trạng thái đăng nhập của Admin
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); // Thông tin admin đang đăng nhập
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Đang kiểm tra token lúc tải trang

  // Khi reload trang → đọc token admin từ localStorage
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminUser");
    if (token && adminData) {
      setAdmin(JSON.parse(adminData));
      setIsAdminAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Đăng nhập admin → lưu token + cập nhật state
  const loginAdmin = (token, adminData) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdmin(adminData);
    setIsAdminAuthenticated(true);
  };

  // Đăng xuất admin → xóa token + reset state
  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAdminAuthenticated, isLoading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Custom hook để dùng dễ hơn
export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
