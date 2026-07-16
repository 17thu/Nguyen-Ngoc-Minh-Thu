import axiosClient from "@/lib/axiosClient";

// Lấy tất cả sản phẩm
export async function getAllProducts() {
    const res = await axiosClient.get("/products");
    return res;
}

// Lấy sản phẩm theo trang (phân trang - theo clip productByPageSize)
export async function productByPageSize(params = { page: 1, pageSize: 8 }) {
    const { page, pageSize, search } = params;
    let queryParams = {
        pagination: { page, pageSize },
        filters: {},
        populate: '*'
    };
    if (search) {
        queryParams.filters.product_name = { $contains: search };
    }
    const res = await axiosClient.get("/productsByPageSize", { params: queryParams });
    return res;
}

// Lấy sản phẩm có filter / search / sort (server-side)
export async function getProductsFiltered(params = {}) {
    const { page = 1, pageSize = 8, search, category, brand, minPrice, maxPrice, sortBy } = params;

    let queryParams = {
        pagination: { page, pageSize },
        filters: {},
        populate: '*'
    };

    // STT 6: Tìm kiếm theo từ khóa -> Đóng gói toán tử $contains gửi lên Laravel
    if (search) {
        queryParams.filters.product_name = { $contains: search };
    }

    // STT 4: Lọc theo Danh mục -> Đóng gói toán tử $eq (bằng ID danh mục) gửi lên Laravel
    if (category) {
        queryParams.filters.cat_id = { $eq: category };
    }

    if (brand) {
        queryParams.filters.brand_id = { $eq: brand };
    }

    // STT 5: Lọc theo khoảng Giá tiền -> Đóng gói toán tử $gte (>= minPrice) và $lte (<= maxPrice)
    if (minPrice || maxPrice) {
        queryParams.filters.price = {};
        if (minPrice) queryParams.filters.price.$gte = minPrice;
        if (maxPrice) queryParams.filters.price.$lte = maxPrice;
    }

    // STT 7: Sắp xếp theo giá / mới nhất -> Gửi chuỗi sort sang Laravel (ví dụ price:asc)
    if (sortBy === 'price_asc') queryParams.sort = 'price:asc';
    if (sortBy === 'price_desc') queryParams.sort = 'price:desc';
    if (sortBy === 'newest') queryParams.sort = 'created_at:desc';

    const res = await axiosClient.get("/activeProductsByPageSize", { params: queryParams });
    return res;
}

// Lấy sản phẩm mới 
export async function getNewProducts(limit) {
    const res = await axiosClient.get(`/newProducts/${limit}`);
    return res;
}

// Lấy sản phẩm bán chạy (hot products)
export async function getBestSellers(limit) {
    const res = await axiosClient.get(`/hotProducts/${limit}`);
    return res;
}

// Lấy sản phẩm xem nhiều (most viewed)
export async function getMostViewedProducts(limit) {
    const res = await axiosClient.get(`/hotProducts/${limit}`);
    return res;
}

// Lấy sản phẩm giảm giá 
export async function getSaleProducts(limit) {
    const res = await axiosClient.get(`/saleProducts/${limit}`);
    return res;
}

// Thêm mới sản phẩm (Admin)
export async function createProduct(formData) {
    const res = await axiosClient.post("/products", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res;
}

// Lấy chi tiết sản phẩm theo ID
export async function getProductById(id) {
    const res = await axiosClient.get(`/products/${id}`);
    return res;
}

// Lấy chi tiết sản phẩm theo Slug (tự động cộng lượt xem thật)
export async function getProductBySlug(slug) {
    const res = await axiosClient.get(`/showDetails/${slug}`);
    return res;
}

// Cập nhật sản phẩm (Admin)
export async function updateProduct(id, formData) {
    const res = await axiosClient.post(`/products/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res;
}

// Xóa mềm sản phẩm (Admin)
export async function deleteProduct(id) {
    const res = await axiosClient.delete(`/products/${id}`);
    return res;
}

// Lấy danh sách sản phẩm trong thùng rác
export async function getTrashedProductsByPageSize(params = { page: 1, pageSize: 8 }) {
    const { page, pageSize, search } = params;
    let queryParams = {
        pagination: { page, pageSize },
        filters: {},
        populate: '*'
    };
    if (search) {
        queryParams.filters.product_name = { $contains: search };
    }
    const res = await axiosClient.get("/trashedProductsByPageSize", { params: queryParams });
    return res;
}

// Khôi phục sản phẩm từ thùng rác
export async function restoreProduct(id) {
    const res = await axiosClient.post(`/products/${id}/restore`);
    return res;
}

// Xóa vĩnh viễn sản phẩm
export async function forceDeleteProduct(id) {
    const res = await axiosClient.delete(`/products/${id}/force`);
    return res;
}

// Lấy sản phẩm theo start limit (cho dashboard)
export async function getProductsByStartLimit(start = 0, limit = 5) {
    const res = await axiosClient.get("/productsByStartLimit", { 
        params: { start, limit } 
    });
    return res;
}