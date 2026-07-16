import axiosClient from "@/lib/axiosClient";

// Lấy tất cả danh mục
export async function getAllCategories() {
    const res = await axiosClient.get("/categories");
    return res;
}

// Lấy danh mục theo trang (phân trang)
export async function categoryByPageSize(pagination = { page: 1, pageSize: 8 }) {
    const res = await axiosClient.get("/categoriesByPageSize", { params: { pagination } });
    return res;
}

// Lấy danh mục đang hoạt động
export async function getActiveCategories() {
    const res = await axiosClient.get("/activeCategories");
    return res;
}

// Lấy chi tiết danh mục theo ID
export async function getCategoryById(id) {
    const res = await axiosClient.get(`/categories/${id}`);
    return res;
}

// Thêm mới danh mục
export async function createCategory(formData) {
    const res = await axiosClient.post("/categories", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res;
}

// Cập nhật danh mục
export async function updateCategory(id, formData) {
    const res = await axiosClient.post(`/categories/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res;
}

// Xóa danh mục
export async function deleteCategory(id) {
    const res = await axiosClient.delete(`/categories/${id}`);
    return res;
}

// Lấy danh sách danh mục trong thùng rác
export async function getTrashedCategoriesByPageSize(params = { page: 1, pageSize: 8 }) {
    const { page, pageSize, search } = params;
    let queryParams = {
        pagination: { page, pageSize },
        filters: {}
    };
    if (search) {
        queryParams.filters.category_name = { $contains: search };
    }
    const res = await axiosClient.get("/trashedCategoriesByPageSize", { params: queryParams });
    return res;
}

// Khôi phục danh mục từ thùng rác
export async function restoreCategory(id) {
    const res = await axiosClient.post(`/categories/${id}/restore`);
    return res;
}

// Xóa vĩnh viễn danh mục
export async function forceDeleteCategory(id) {
    const res = await axiosClient.delete(`/categories/${id}/force`);
    return res;
}
