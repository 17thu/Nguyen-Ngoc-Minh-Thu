import axiosClient from "@/lib/axiosClient";

// Lấy toàn bộ danh sách thành viên/khách hàng cho admin
export async function getAllUsers() {
  try {
    const res = await axiosClient.get("/users");
    return res;
  } catch (error) {
    return { data: [] };
  }
}

// Thêm mới thành viên
export async function createUser(data) {
  const res = await axiosClient.post("/users", data);
  return res.data || res;
}

// Cập nhật thành viên
export async function updateUser(id, data) {
  const res = await axiosClient.put(`/users/${id}`, data);
  return res.data || res;
}

// Xóa thành viên
export async function deleteUser(id) {
  const res = await axiosClient.delete(`/users/${id}`);
  return res.data || res;
}
