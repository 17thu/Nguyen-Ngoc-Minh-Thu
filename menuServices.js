import axiosClient from "@/lib/axiosClient";

// Lấy danh sách menu đang hoạt động (dùng cho storefront)
export async function getActiveMenus() {
  try {
    const res = await axiosClient.get("/activeMenus");
    return res;
  } catch (error) {
    try {
      const res = await axiosClient.get("/menus");
      return res;
    } catch (e) {
      return { data: [] };
    }
  }
}

// Lấy toàn bộ danh sách menu cho admin
export async function getAllMenus() {
  try {
    const res = await axiosClient.get("/menus");
    return res;
  } catch (error) {
    return { data: [] };
  }
}

// Thêm mới menu
export async function createMenu(data) {
  const res = await axiosClient.post("/menus", data);
  return res.data || res;
}

// Cập nhật menu
export async function updateMenu(id, data) {
  const res = await axiosClient.put(`/menus/${id}`, data);
  return res.data || res;
}

// Xóa menu
export async function deleteMenu(id) {
  const res = await axiosClient.delete(`/menus/${id}`);
  return res.data || res;
}
