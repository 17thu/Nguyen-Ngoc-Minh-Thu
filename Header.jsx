"use client";

import Link from 'next/link';
import Menu from '@/components/shop/Menu';
import { useAuth } from '@/context/AuthContext';
import LogoutButton from '@/components/shop/LogoutButton';

export default function Header() {
  // Lấy trạng thái đăng nhập từ AuthContext
  const { isAuthenticated, user } = useAuth();

  const avatarUrl = user?.image
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.image}`
    : null;

  return (
    <>
      {/* Top Header */}
      <header className="bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 text-rose-900 shadow-sm relative z-50 border-b border-white">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-overlay rounded-b-none overflow-hidden"></div>

        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-3xl font-extrabold italic tracking-wider flex items-center gap-2 drop-shadow-sm cursor-pointer hover:scale-105 transition-transform text-rose-600">
              <span className="animate-pulse text-pink-400">✨</span>
              <Link href="/">Sweet Bakery</Link>
              <span className="text-xl animate-bounce text-pink-400">🍓</span>
            </div>

            <div className="flex-1 w-full max-w-2xl px-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Tìm bánh dâu, đồ uống ngọt..."
                  className="w-full py-2.5 px-5 rounded-full text-rose-800 bg-white/90 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-200/50 shadow-inner transition-all placeholder-rose-300 border border-pink-100"
                />
                <button className="absolute right-1 top-1 bottom-1 px-6 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-full transition-all shadow-sm font-bold flex items-center gap-1 border border-white/50">
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-bold text-rose-500">
              <Link href="/lookup" className="flex flex-col items-center hover:text-pink-600 hover:-translate-y-1 transition-all">
                <svg className="w-6 h-6 mb-1 drop-shadow-sm text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Tra cứu
              </Link>
              <Link href="/cart" className="flex flex-col items-center hover:text-pink-600 hover:-translate-y-1 transition-all relative">
                <div className="relative">
                  <svg className="w-6 h-6 mb-1 drop-shadow-sm text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse border-2 border-white">0</span>
                </div>
                Giỏ hàng
              </Link>

              {/* Dựa vào isAuthenticated → hiển thị khác nhau */}
              {isAuthenticated ? (
                // ✅ ĐÃ ĐĂNG NHẬP → Avatar + tên + dropdown gọn
                <div className="relative group">
                  <div className="flex flex-col items-center hover:text-pink-600 hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="w-6 h-6 mb-1 rounded-full border-2 border-pink-400 overflow-hidden shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-black">${user?.name?.charAt(0).toUpperCase()}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-black">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold">{user?.name?.split(" ").pop()}</span>
                  </div>

                  {/* Dropdown gọn: tên + Đăng xuất */}
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl shadow-pink-100 border border-pink-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-pink-50 bg-pink-50/50">
                      <p className="text-xs text-rose-400">Xin chào,</p>
                      <p className="text-sm font-black text-rose-800 truncate">{user?.name}</p>
                    </div>
                    <LogoutButton />
                  </div>
                </div>
              ) : (
                // ❌ CHƯA ĐĂNG NHẬP → Hiện Login / Register
                <>
                  <Link href="/login" className="flex flex-col items-center hover:text-pink-600 hover:-translate-y-1 transition-all">
                    <svg className="w-6 h-6 mb-1 drop-shadow-sm text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="flex flex-col items-center hover:text-pink-600 hover:-translate-y-1 transition-all">
                    <svg className="w-6 h-6 mb-1 drop-shadow-sm text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Menu below search */}
          <Menu />
        </div>
      </header>
    </>
  );
}
