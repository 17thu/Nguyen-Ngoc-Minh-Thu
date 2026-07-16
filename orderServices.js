import axiosClient from "@/lib/axiosClient";

/**
 * Gọi API tạo đơn hàng mới - Next.js bridge encaminha para Laravel backend
 * @param {Object} data - Dữ liệu đơn hàng bao gồm customerInfo, items, totalPrice
 */
export const createOrder = async (data) => {
  try {
    // Lấy token từ localStorage
    const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
    
    // POST para /api/db-orders (Next.js) -> encaminha para Laravel /saveOrder
    const payload = {
      ...data,
      token, // Gửi token để xác thực với Laravel
    };
    
    const res = await fetch("/api/db-orders", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }) // Cũng gửi via header
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      console.error("DB Orders error:", result.error);
    }
    return result;
  } catch (err) {
    console.error("Error creating order:", err);
    throw err;
  }
};

/**
 * Gọi API lấy danh sách đơn hàng của người dùng hiện tại
 */
export const getUserOrders = async () => {
  try {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('accessToken') || localStorage.getItem('token'))
      : null;

    // Gửi kèm token để bridge forward lên Laravel → trả về order_details
    const res = await fetch("/api/db-orders", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });
    const dbData = await res.json();
    if (dbData.success && Array.isArray(dbData.data)) {
      return dbData.data;
    }
  } catch (e) {
    console.error("Error fetching orders via bridge:", e);
  }
  
  // Fallback: gọi Laravel trực tiếp qua axiosClient (có token)
  try {
    const result = await axiosClient.get('/ordersByPageSize');
    return result.data?.data || result.data || [];
  } catch (e) {
    console.error("Error fetching orders from Laravel:", e);
    return [];
  }
};

/**
 * Gọi API lấy chi tiết 1 đơn hàng cụ thể
 */
export const getOrderById = async (id) => {
  return axiosClient.get(`/orders/${id}`);
};

/**
 * Gọi API lấy toàn bộ danh sách đơn hàng cho trang Admin (kết hợp MySQL trực tiếp)
 */
export const getAllOrders = async () => {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
    const res = await fetch("/api/db-orders", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const dbData = await res.json();
    if (dbData.success && Array.isArray(dbData.data)) {
      return { data: dbData.data };
    }
  } catch (e) {}
  return axiosClient.get('/orders');
};

/**
 * Gọi API cập nhật trạng thái đơn hàng (Admin & MySQL trực tiếp)
 */
export const updateOrderStatus = async (id, status) => {
  try {
    await fetch("/api/db-orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  } catch (e) {}
  return axiosClient.put(`/orders/${id}`, { status });
};

/**
 * Gọi API xóa đơn hàng (Admin & MySQL trực tiếp)
 */
export const deleteOrder = async (id) => {
  try {
    await fetch(`/api/db-orders?id=${id}`, {
      method: "DELETE",
    });
  } catch (e) {}
  return axiosClient.delete(`/orders/${id}`);
};

/**
 * Gọi API lấy danh sách đơn hàng theo trang (Admin)
 */
export const getOrdersByPageSize = async (page = 1, pageSize = 10) => {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
    const res = await fetch("/api/db-orders", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const dbData = await res.json();
    if (dbData.success && Array.isArray(dbData.data)) {
      const start = (page - 1) * pageSize;
      return { 
        data: dbData.data.slice(start, start + pageSize),
        pagination: {
          page,
          pageSize,
          total: dbData.data.length,
          pageCount: Math.ceil(dbData.data.length / pageSize),
        }
      };
    }
  } catch (e) {}
  return axiosClient.get('/ordersByPageSize', {
    params: { 'pagination.page': page, 'pagination.pageSize': pageSize }
  });
};
