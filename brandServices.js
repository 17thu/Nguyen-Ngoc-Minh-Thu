import axiosClient from "@/lib/axiosClient";

export async function getActiveBrands() {
    const res = await axiosClient.get("/activeBrands");
    return res;
}

export async function getAllBrands() {
    const res = await axiosClient.get("/brands");
    return res;
}

export async function brandByPageSize(params = { page: 1, pageSize: 8 }) {
    const { page, pageSize, search } = params;
    let queryParams = {
        pagination: { page, pageSize },
        filters: {}
    };
    if (search) {
        queryParams.filters.name = { $contains: search };
    }
    const res = await axiosClient.get("/brandsByPageSize", { params: queryParams });
    return res;
}

export async function getBrandById(id) {
    const res = await axiosClient.get(`/brands/${id}`);
    return res;
}

export async function createBrand(formData) {
    const res = await axiosClient.post("/brands", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res;
}

export async function updateBrand(id, formData) {
    const res = await axiosClient.post(`/brands/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res;
}

export async function deleteBrand(id) {
    const res = await axiosClient.delete(`/brands/${id}`);
    return res;
}
