"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authServices";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(formData);
      console.log("Login successful:", res);

      // Cập nhật trạng thái đăng nhập toàn app qua AuthContext
      loginAuth(res.data.access_token, res.data.data);

      // Chuyển hướng về trang chủ
      router.push("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Sai email hoặc mật khẩu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-rose-900 placeholder-rose-300 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-pink-400 font-serif italic text-xl mb-1">✨ Sweet Bakery ✨</p>
          <h1 className="text-4xl font-black text-rose-900 mb-2">Đăng Nhập</h1>
          <p className="text-rose-400 text-sm">
            Chào mừng trở lại! Đăng nhập để tiếp tục mua sắm 🍰
          </p>
        </div>

        {/* Form box */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-pink-200/50 border border-pink-100 p-8">

          {/* Icon trung tâm */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 border-4 border-pink-200 shadow-lg flex items-center justify-center text-4xl">
              🧁
            </div>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
              <span className="text-red-500 text-sm">⚠️</span>
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="example@gmail.com"
                required
                disabled={loading}
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1.5 uppercase tracking-wide">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Quên mật khẩu */}
            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs text-pink-400 hover:text-rose-500 hover:underline transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-black text-base rounded-2xl transition-all shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 flex justify-center items-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>🍓 ĐĂNG NHẬP</>
              )}
            </button>
          </form>

          {/* Link đăng ký */}
          <div className="mt-6 text-center">
            <p className="text-sm text-rose-400">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-black text-pink-500 hover:text-rose-600 hover:underline transition-colors"
              >
                Đăng ký ngay →
              </Link>
            </p>
          </div>
        </div>

        {/* Decoration */}
        <p className="text-center text-rose-300 text-xs mt-6">
          🍓 Sweet Bakery — Ngọt ngào từng khoảnh khắc
        </p>
      </div>
    </div>
  );
}