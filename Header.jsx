"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { logoutAdmin } from "@/services/adminServices";
import toast from "react-hot-toast";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin, logoutAdmin: clearAdminAuth } = useAdminAuth();

  const handleSearch = useCallback((e) => {
    const term = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    if (pathname === "/admin/products" || pathname === "/admin/categories") {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pathname, router, searchParams]);

  const handleLogout = async () => {
    try {
      await logoutAdmin(); // Gọi API hủy token trên server
    } catch {
      // Kể cả lỗi vẫn logout phía frontend
    }
    clearAdminAuth(); // Xóa token + state
    toast.success("Đã đăng xuất tài khoản Admin");
    router.push("/admin/login");
  };

  // Lấy chữ cái đầu tên admin để hiển thị avatar
  const adminInitial = admin?.name?.charAt(0).toUpperCase() || "A";

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg hidden md:block">
        <div className="relative group">
          <svg className="w-5 h-5 text-pink-300 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={
              pathname === "/admin/products" ? "Tìm kiếm sản phẩm..." :
              pathname === "/admin/categories" ? "Tìm kiếm danh mục..." :
              pathname === "/admin/users" ? "Tìm kiếm người dùng..." :
              "Tìm kiếm..."
            }
            defaultValue={searchParams.get("search") || ""}
            onChange={handleSearch}
            className="w-full bg-pink-50/50 border border-pink-100 text-rose-900 text-sm rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 focus:bg-white block pl-14 pr-6 py-3 transition-all outline-none font-medium placeholder-pink-300 shadow-sm"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Notification bell */}
        <button className="relative p-2 text-pink-400 hover:text-pink-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-pink-100" />

        <div className="relative group py-1">
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white mb-1">
              {adminInitial}
            </div>
            <span className="text-xs font-bold text-rose-900 group-hover:text-pink-600 transition-colors text-center">
              {admin?.name?.split(" ").pop() || "Admin"}
            </span>
          </div>

          {/* Dropdown menu - Hiển thị khi hover */}
          <div className="absolute right-0 top-full pt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 translate-y-1 group-hover:translate-y-0">
            <div className="bg-white rounded-2xl shadow-xl shadow-pink-100 border border-pink-100 overflow-hidden">
              <div className="px-4 py-3 bg-pink-50/60 border-b border-pink-100">
                <p className="text-xs text-rose-400">Xin chào,</p>
                <p className="text-sm font-black text-rose-800 truncate">{admin?.name || "Admin"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
