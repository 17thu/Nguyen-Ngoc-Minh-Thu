import axiosClient from "@/lib/axiosClient";

// Đăng nhập admin → POST /api/admin/login
export async function loginAdmin(data) {
  const response = await axiosClient.post("admin/login", data);
  return response.data;
}

// Đăng xuất admin → POST /api/auth/logout (dùng chung route logout với adminToken)
export async function logoutAdmin() {
  const token = localStorage.getItem("adminToken");
  const response = await axiosClient.post(
    "auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
