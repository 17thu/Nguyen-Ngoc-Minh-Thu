"use client";
import { useState, useEffect } from "react";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://127.0.0.1:8000/storage/";

const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function CategoryForm({
  initialValues = {},
  onSubmit,
  categories = [], // Danh sách các danh mục khác để chọn làm danh mục cha
  isEdit = false,
  currentImage = null,
  serverErrors = {},
  isSubmitting = false
}) {
  const [form, setForm] = useState({
    category_name: "",
    slug: "",
    parent_id: "0",
    sort_order: "",
    status: "1",
    description: ""
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      if (!isEdit && !initialValues.id && !initialValues.category_name && !initialValues.slug) {
        return;
      }
      if (!isEdit && (form.category_name !== "" || form.slug !== "")) return;

      setForm({
        category_name: initialValues.category_name || "",
        slug: initialValues.slug || "",
        parent_id: initialValues.parent_id !== undefined && initialValues.parent_id !== null ? String(initialValues.parent_id) : "0",
        sort_order: initialValues.sort_order !== undefined && initialValues.sort_order !== null ? String(initialValues.sort_order) : "",
        status: initialValues.status !== undefined && initialValues.status !== null ? String(initialValues.status) : "1",
        description: initialValues.description || ""
      });
      setSlugEdited(false);
    }
  }, [initialValues, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "slug") {
      setSlugEdited(true);
    }
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "category_name") {
        if (!isEdit && (!slugEdited || !prev.slug || prev.slug === slugify(prev.category_name))) {
          updated.slug = slugify(value);
        } else if (isEdit && (!prev.slug || prev.slug === slugify(prev.category_name))) {
          updated.slug = slugify(value);
        }
      }
      return updated;
    });

    if (clientErrors[name]) {
      setClientErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const getError = (field) => {
    if (clientErrors[field]) return clientErrors[field];
    if (serverErrors[field]) return Array.isArray(serverErrors[field]) ? serverErrors[field][0] : serverErrors[field];
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!form.category_name || !form.category_name.trim()) {
      errors.category_name = "Tên danh mục không được để trống";
    }

    if (!form.slug || !form.slug.trim()) {
      errors.slug = "Slug đường dẫn không được để trống";
    }

    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const formData = new FormData();
    if (isEdit) {
      formData.append("_method", "PUT");
    }
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val ?? "");
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-6" style={{ border: "1px solid #fecdd3" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên danh mục */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Tên danh mục *</label>
          <input
            name="category_name"
            value={form.category_name}
            onChange={handleChange}
            placeholder="Bánh Sinh Nhật..."
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: getError("category_name") ? "#f43f5e" : "#fecdd3" }}
          />
          {getError("category_name") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("category_name")}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Slug đường dẫn *</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="banh-sinh-nhat"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: getError("slug") ? "#f43f5e" : "#fecdd3" }}
          />
          {getError("slug") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("slug")}</p>}
        </div>

        {/* Danh mục cha */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Danh mục cha</label>
          <select
            name="parent_id"
            value={form.parent_id}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: "#fecdd3" }}
          >
            <option value="0">-- Danh mục gốc --</option>
            {Array.isArray(categories) && categories
              .filter(c => !isEdit || String(c.id) !== String(initialValues.id)) // Không chọn chính mình làm cha
              .map(c => (
                <option key={c.id} value={c.id}>{c.category_name || c.name}</option>
              ))}
          </select>
        </div>

        {/* Thứ tự sắp xếp */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Thứ tự sắp xếp (Sort Order)</label>
          <input
            type="number"
            name="sort_order"
            value={form.sort_order}
            onChange={handleChange}
            placeholder="1, 2, 3..."
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: "#fecdd3" }}
          />
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Trạng thái</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white font-medium"
            style={{ borderColor: "#fecdd3", color: form.status === "1" ? "#059669" : "#e11d48" }}
          >
            <option value="1">● Hiển thị</option>
            <option value="0">● Ẩn</option>
          </select>
        </div>
      </div>

      {/* Hình ảnh */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Hình ảnh danh mục</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 rounded-xl border text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100"
            style={{ borderColor: getError("image") ? "#f43f5e" : "#fecdd3" }}
          />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-rose-200 shadow-sm" />
          ) : currentImage ? (
            <img
              src={currentImage.startsWith('http') ? currentImage : currentImage.startsWith('storage/') ? `http://127.0.0.1:8000/${currentImage}` : `${IMAGE_BASE_URL}${currentImage}`}
              alt="Current"
              className="w-14 h-14 object-cover rounded-xl border border-rose-200 shadow-sm"
            />
          ) : null}
        </div>
        {getError("image") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("image")}</p>}
      </div>

      {/* Mô tả chi tiết */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Mô tả danh mục</label>
        <textarea
          rows="3"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Giới thiệu nhanh về nhóm bánh này..."
          className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300"
          style={{ borderColor: "#fecdd3" }}
        />
      </div>

      {/* Nút Submit */}
      <div className="pt-2 flex justify-end gap-3" style={{ borderTop: "1px solid #fff1f2" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition hover:opacity-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
        >
          {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm mới danh mục"}
        </button>
      </div>
    </form>
  );
}
