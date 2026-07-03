import axios from "axios";
import API_CONFIG from "@/config/api";

const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

// Tự động đính kèm Token đăng nhập vào Header trước mỗi lần gửi request lên Backend
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      const token = isAdminRoute
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;