"use client";

import { createContext, useContext, useEffect, useState } from "react";

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Khi reload trang → kiểm tra token còn tồn tại hay không
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Hàm đăng nhập → lưu token + cập nhật state
  const loginAuth = (token, userData) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Hàm đăng xuất → xóa token + reset state
  const logoutAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginAuth, logoutAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook để dùng context dễ hơn
export function useAuth() {
  return useContext(AuthContext);
}
