import axiosClient from "@/lib/axiosClient";

export async function getActivePosts() {
  const res = await axiosClient.get("/activePosts");
  return res;
}

export async function getPostsByPageSize(params = { page: 1, pageSize: 10 }) {
  const res = await axiosClient.get("/postsByPageSize", { params });
  return res;
}

export async function getPostByIdOrSlug(idOrSlug) {
  const res = await axiosClient.get(`/posts/${idOrSlug}`);
  return res;
}
