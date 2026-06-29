import axiosClient from "@/lib/axiosClient";

export async function register(data) {
  try {
    const response = await axiosClient.post("auth/local/register", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    console.log(err.response?.data); //thêm dòng này để log lỗi chi tiết
    throw err;
  }
}

export async function login(data) {
  return axiosClient.post("auth/local", data);
}
