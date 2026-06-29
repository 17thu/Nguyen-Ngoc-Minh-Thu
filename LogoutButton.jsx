"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { logoutAuth } = useAuth();

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    // Reset trạng thái đăng nhập (trong AuthContext)
    logoutAuth();

    // Điều hướng về trang Home
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-500 hover:bg-pink-50 hover:text-rose-700 transition-colors font-medium"
    >
      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Đăng xuất
    </button>
  );
}
