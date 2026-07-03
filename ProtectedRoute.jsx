"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã load xong mà chưa đăng nhập thì đẩy về trang login
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Trong lúc đang kiểm tra token, hiển thị màn hình loading
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-pink-500 font-bold mt-4">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  // Nếu chưa đăng nhập, trả về null (tránh nháy giao diện trước khi redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Nếu đã đăng nhập thành công, hiển thị trang
  return <>{children}</>;
}
