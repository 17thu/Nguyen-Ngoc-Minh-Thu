"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById, updateProduct } from "@/services/productServices";
import { getAllCategories } from "@/services/categoryServices";
import { getActiveBrands } from "@/services/brandServices";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://127.0.0.1:8000/storage/";

export default function EditProductPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id;
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [discountPct, setDiscountPct] = useState(""); // % giảm giá (chỉ dùng trên UI)

  const [form, setForm] = useState({
    product_name: "", slug: "", cat_id: "", brand_id: "",
    price: "", sale_price: "0", is_on_sale: "0", qty: "10", status: "1", description: ""
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([getProductById(id), getAllCategories(), getActiveBrands().catch(() => ({ data: [] }))])
      .then(([prodRes, catRes, brandRes]) => {
        const catData = catRes?.data?.categories || catRes?.data?.data || catRes?.data || [];
        const brandData = brandRes?.data?.data || brandRes?.data || [];
        setCategories(Array.isArray(catData) ? catData : []);
        setBrands(Array.isArray(brandData) ? brandData : []);
        const p = prodRes?.data?.data || prodRes?.data || {};
        const price = p.price ?? "";
        const salePrice = p.sale_price ?? "0";
        // Tính ngược % giảm giá từ giá gốc và giá sale
        let pct = "";
        if (p.is_on_sale && Number(price) > 0 && Number(salePrice) > 0) {
          pct = String(Math.round((1 - Number(salePrice) / Number(price)) * 100));
        }
        setDiscountPct(pct);
        setForm({
          product_name: p.product_name || "",
          slug: p.slug || "",
          cat_id: p.cat_id || "",
          brand_id: p.brand_id || "",
          price,
          sale_price: salePrice,
          is_on_sale: p.is_on_sale ? "1" : "0",
          qty: p.qty ?? "10",
          status: p.status !== undefined ? String(p.status) : "1",
          description: p.description || ""
        });
        setCurrentImage(p.image);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Khi thay đổi giá gốc → tính lại sale_price từ % hiện tại
      if (name === "price" && discountPct && Number(discountPct) > 0) {
        const computed = Math.round(Number(value) * (1 - Number(discountPct) / 100));
        updated.sale_price = String(computed > 0 ? computed : 0);
      }
      return updated;
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(form).forEach(([key, val]) => formData.append(key, val ?? ""));
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await updateProduct(id, formData);
      alert(res?.data?.message || "Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8 space-y-6" style={{ background: "#FFF5F7", minHeight: "100%" }}>
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#9f1239" }}>Chỉnh sửa sản phẩm #{id}</h1>
          <p className="text-sm mt-1" style={{ color: "#fb7185" }}>Cập nhật thông tin chi tiết và hình ảnh cho bánh</p>
        </div>
        <Link
          href="/admin/products"
          className="px-5 py-2.5 bg-white text-sm font-semibold rounded-xl transition shadow-sm hover:bg-rose-50"
          style={{ color: "#9f1239", border: "1px solid #fecdd3" }}
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {/* ── Form Card ── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-6" style={{ border: "1px solid #fecdd3" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Tên sản phẩm *</label>
            <input name="product_name" value={form.product_name} onChange={handleChange} placeholder="Bánh Kem Dâu Tây..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: errors.product_name ? "#f43f5e" : "#fecdd3" }} required />
            {errors.product_name && <p className="text-xs text-rose-500 mt-1">{errors.product_name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Slug đường dẫn *</label>
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="banh-kem-dau-tay" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: errors.slug ? "#f43f5e" : "#fecdd3" }} required />
            {errors.slug && <p className="text-xs text-rose-500 mt-1">{errors.slug[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Danh mục *</label>
            <select name="cat_id" value={form.cat_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: errors.cat_id ? "#f43f5e" : "#fecdd3" }} required>
              <option value="">-- Chọn danh mục --</option>
              {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.id}>{c.category_name || c.name}</option>)}
            </select>
            {errors.cat_id && <p className="text-xs text-rose-500 mt-1">{errors.cat_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Thương hiệu</label>
            <select name="brand_id" value={form.brand_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: "#fecdd3" }}>
              <option value="">-- Chọn thương hiệu --</option>
              {Array.isArray(brands) && brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Giá bán (VNĐ) *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="250000" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-semibold text-rose-600 transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: errors.price ? "#f43f5e" : "#fecdd3" }} required />
            {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Khuyến mãi</label>
              <select name="is_on_sale" value={form.is_on_sale} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: "#fecdd3" }}>
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

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Số lượng kho</label>
            <input type="number" name="qty" value={form.qty} onChange={handleChange} placeholder="10" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: "#fecdd3" }} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white font-medium" style={{ borderColor: "#fecdd3", color: form.status === "1" ? "#059669" : "#e11d48" }}>
              <option value="1">● Hiển thị</option>
              <option value="0">● Ẩn</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Hình ảnh sản phẩm</label>
          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 rounded-xl border text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100" style={{ borderColor: "#fecdd3" }} />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-rose-200 shadow-sm" />
            ) : currentImage ? (
              <img src={currentImage.startsWith('http') ? currentImage : currentImage.startsWith('storage/') ? `http://127.0.0.1:8000/${currentImage}` : `${IMAGE_BASE_URL}${currentImage}`} alt="Current" className="w-14 h-14 object-cover rounded-xl border border-rose-200 shadow-sm" />
            ) : null}
          </div>
          {errors.image && <p className="text-xs text-rose-500 mt-1">{errors.image[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>Mô tả chi tiết</label>
          <textarea rows="4" name="description" value={form.description} onChange={handleChange} placeholder="Hương vị, nguyên liệu, cách bảo quản..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-rose-300" style={{ borderColor: "#fecdd3" }} />
        </div>

        <div className="pt-2 flex justify-end gap-3" style={{ borderTop: "1px solid #fff1f2" }}>
          <button type="submit" className="px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition hover:opacity-95" style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
