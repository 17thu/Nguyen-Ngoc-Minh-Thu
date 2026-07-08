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

export default function ProductForm({
  initialValues = {},
  onSubmit,
  categories = [],
  brands = [],
  isEdit = false,
  currentImage = null,
  serverErrors = {},
  isSubmitting = false
}) {
  const [form, setForm] = useState({
    product_name: "",
    slug: "",
    cat_id: "",
    brand_id: "",
    price: "",
    sale_price: "0",
    is_on_sale: "0",
    qty: "10",
    status: "1",
    description: ""
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const [discountPct, setDiscountPct] = useState(""); // % giảm giá (chỉ dùng trên UI)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clientErrors, setClientErrors] = useState({});

  // Cập nhật form khi initialValues thay đổi (đặc biệt khi tải dữ liệu trong trang chỉnh sửa)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      if (!isEdit && !initialValues.id && !initialValues.product_name && !initialValues.slug) {
        return;
      }
      if (!isEdit && (form.product_name !== "" || form.slug !== "")) return;

      const price = initialValues.price !== undefined && initialValues.price !== null ? String(initialValues.price) : "";
      const salePrice = initialValues.sale_price !== undefined && initialValues.sale_price !== null ? String(initialValues.sale_price) : "0";
      
      // Tính ngược % giảm giá từ giá gốc và giá sale
      let pct = "";
      if ((initialValues.is_on_sale === "1" || initialValues.is_on_sale === true || initialValues.is_on_sale === 1) && Number(price) > 0 && Number(salePrice) > 0) {
        pct = String(Math.round((1 - Number(salePrice) / Number(price)) * 100));
      }
      setDiscountPct(pct);

      setForm({
        product_name: initialValues.product_name || "",
        slug: initialValues.slug || "",
        cat_id: initialValues.cat_id !== undefined && initialValues.cat_id !== null ? String(initialValues.cat_id) : "",
        brand_id: initialValues.brand_id !== undefined && initialValues.brand_id !== null ? String(initialValues.brand_id) : "",
        price,
        sale_price: salePrice,
        is_on_sale: initialValues.is_on_sale ? "1" : "0",
        qty: initialValues.qty !== undefined && initialValues.qty !== null ? String(initialValues.qty) : "10",
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
      // Tự động tạo slug từ tên sản phẩm nếu chưa nhập slug
      if (name === "product_name") {
        if (!isEdit && (!slugEdited || !prev.slug || prev.slug === slugify(prev.product_name))) {
          updated.slug = slugify(value);
        } else if (isEdit && (!prev.slug || prev.slug === slugify(prev.product_name))) {
          updated.slug = slugify(value);
        }
      }
      // Khi thay đổi giá gốc → tính lại sale_price từ % hiện tại
      if (name === "price" && discountPct && Number(discountPct) > 0) {
        const computed = Math.round(Number(value) * (1 - Number(discountPct) / 100));
        updated.sale_price = String(computed > 0 ? computed : 0);
      }
      return updated;
    });

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (clientErrors[name]) {
      setClientErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Xử lý khi admin nhập % giảm giá
  const handleDiscountPct = (e) => {
    const pct = e.target.value;
    setDiscountPct(pct);
    if (pct === "" || isNaN(pct)) {
      setForm(prev => ({ ...prev, sale_price: "0" }));
      return;
    }
    const p = Math.min(Math.max(Number(pct), 0), 99);
    const price = Number(form.price);
    if (price > 0) {
      const computed = Math.round(price * (1 - p / 100));
      setForm(prev => ({ ...prev, sale_price: String(computed > 0 ? computed : 0) }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // Lấy thông báo lỗi cho từng trường (ưu tiên lỗi JS Frontend trước, sau đó tới lỗi Server)
  const getError = (field) => {
    if (clientErrors[field]) return clientErrors[field];
    if (serverErrors[field]) return Array.isArray(serverErrors[field]) ? serverErrors[field][0] : serverErrors[field];
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    // --- CÂU 4: VALIDATE DỮ LIỆU FORM TRƯỚC KHI SUBMIT ---
    // 1. Tên sản phẩm không được rỗng
    if (!form.product_name || !form.product_name.trim()) {
      errors.product_name = "Tên sản phẩm không được để trống";
    }

    // 2. Slug đường dẫn không được rỗng
    if (!form.slug || !form.slug.trim()) {
      errors.slug = "Slug đường dẫn không được để trống";
    }

    // 3. Category phải được chọn
    if (!form.cat_id || String(form.cat_id).trim() === "") {
      errors.cat_id = "Vui lòng chọn danh mục cho sản phẩm";
    }

    // 4. Giá phải là số > 0
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      errors.price = "Giá sản phẩm phải là số lớn hơn 0 (VNĐ)";
    }

    setClientErrors(errors);

    // Nếu có lỗi thì dừng lại không gửi API
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Đóng gói FormData
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
        {/* Tên sản phẩm */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Tên sản phẩm *</label>
          <input
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="Bánh Kem Dâu Tây..."
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: getError("product_name") ? "#f43f5e" : "#fecdd3" }}
          />
          {getError("product_name") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("product_name")}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Slug đường dẫn *</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="banh-kem-dau-tay"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: getError("slug") ? "#f43f5e" : "#fecdd3" }}
          />
          {getError("slug") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("slug")}</p>}
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Danh mục *</label>
          <select
            name="cat_id"
            value={form.cat_id}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: getError("cat_id") ? "#f43f5e" : "#fecdd3" }}
          >
            <option value="">-- Chọn danh mục --</option>
            {Array.isArray(categories) && categories.map(c => (
              <option key={c.id} value={c.id}>{c.category_name || c.name}</option>
            ))}
          </select>
          {getError("cat_id") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("cat_id")}</p>}
        </div>

        {/* Thương hiệu */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Thương hiệu</label>
          <select
            name="brand_id"
            value={form.brand_id}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: "#fecdd3" }}
          >
            <option value="">-- Chọn thương hiệu --</option>
            {Array.isArray(brands) && brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Giá bán */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Giá bán (VNĐ) *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="250000"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-semibold text-rose-600 transition focus:ring-2 focus:ring-rose-300"
            style={{ borderColor: getError("price") ? "#f43f5e" : "#fecdd3" }}
          />
          {getError("price") && <p className="text-xs text-rose-500 mt-1 font-semibold">● {getError("price")}</p>}
        </div>

        {/* Khuyến mãi & Giảm giá */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Khuyến mãi</label>
            <select
              name="is_on_sale"
              value={form.is_on_sale}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
              style={{ borderColor: "#fecdd3" }}
            >
              <option value="0">Không giảm</option>
              <option value="1">Đang giảm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Giảm giá (%)</label>
            <div className="relative">
              <input
                type="number"
                min="1" max="99"
                value={discountPct}
                onChange={handleDiscountPct}
                placeholder="Vd: 20"
                disabled={form.is_on_sale === "0"}
                className="w-full px-3 py-2.5 pr-9 rounded-xl border text-sm outline-none disabled:bg-gray-50 transition focus:ring-2 focus:ring-rose-300"
                style={{ borderColor: "#fecdd3" }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm pointer-events-none">%</span>
            </div>
            {form.is_on_sale === "1" && discountPct && Number(form.price) > 0 && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                → Giá sau giảm: {Number(form.sale_price).toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>
        </div>

        {/* Số lượng kho */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Số lượng kho</label>
          <input
            type="number"
            name="qty"
            value={form.qty}
            onChange={handleChange}
            placeholder="10"
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
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Hình ảnh sản phẩm</label>
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
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Mô tả chi tiết</label>
        <textarea
          rows="4"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Hương vị, nguyên liệu, cách bảo quản..."
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
          {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm mới sản phẩm"}
        </button>
      </div>
    </form>
  );
}
