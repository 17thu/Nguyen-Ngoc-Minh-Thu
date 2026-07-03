"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";

// Component con để có thể dùng useAdminAuth() hook bên trong Provider
function AdminLayoutContent({ children }) {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Chưa đăng nhập và không phải đang ở trang login → chuyển về trang login
    if (!isLoading && !isAdminAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, isLoading, pathname, router]);

  // Đang kiểm tra token → hiển thị loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-rose-500 font-bold text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Trang login admin → không wrap Sidebar/Header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Chưa xác thực → không render gì (đang redirect)
  if (!isAdminAuthenticated) return null;

  // Đã đăng nhập → hiển thị layout đầy đủ
  return (
    <div className="flex bg-[#FFF5F7] min-h-screen text-rose-950 font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FA]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
