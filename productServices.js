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

    if (search) {
        queryParams.filters.product_name = { $contains: search };
    }

    if (category) {
        queryParams.filters.cat_id = { $eq: category };
    }

    if (brand) {
        queryParams.filters.brand_id = { $eq: brand };
    }

    if (minPrice || maxPrice) {
        queryParams.filters.price = {};
        if (minPrice) queryParams.filters.price.$gte = minPrice;
        if (maxPrice) queryParams.filters.price.$lte = maxPrice;
    }

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