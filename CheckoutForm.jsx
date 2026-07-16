"use client";
import { useState } from "react";

/**
 * Câu 4.1. CheckoutForm Component
 *
 * Props:
 *   - onSubmit : Hàm callback gọi khi submit form -> onSubmit(formData)
 *   - initialData : Dữ liệu khởi tạo (nếu có từ tài khoản người dùng)
 *
 * Nhiệm vụ:
 *   - Hiển thị form thông tin: Họ tên, Số điện thoại, Email, Địa chỉ, Ghi chú, Phương thức thanh toán
 *   - Khi submit form -> kiểm tra hợp lệ -> gọi onSubmit(formData)
 */
export default function CheckoutForm({ onSubmit, initialData = {}, submitting = false }) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || initialData.name || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    address: initialData.address || "",
    note: "",
    paymentMethod: "cod", // 'cod' | 'banking' | 'momo'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    return newErrors;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (typeof onSubmit === "function") {
      onSubmit(formData);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "0.85rem 1rem",
    borderRadius: "0.875rem",
    border: hasError ? "2px solid #f43f5e" : "1.5px solid #fecdd3",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fff",
  });

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#881337",
    marginBottom: "0.4rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: "#fff",
      borderRadius: "1.5rem",
      border: "1.5px solid #fecdd3",
      padding: "1.75rem",
      boxShadow: "0 8px 30px rgba(225,29,72,0.08)",
    }}>
      <h3 style={{
        fontSize: "1.2rem",
        fontWeight: 800,
        color: "#881337",
        margin: "0 0 1.5rem 0",
        paddingBottom: "0.75rem",
        borderBottom: "2px solid #ffe4e6",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}>
        <span>📍</span> THÔNG TIN GIAO HÀNG
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Họ và tên */}
        <div>
          <label style={labelStyle}>Họ và tên người nhận *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="VD: Nguyễn Văn A"
            style={inputStyle(errors.fullName)}
            onFocus={e => { e.target.style.borderColor = "#e11d48"; }}
            onBlur={e => { if (!errors.fullName) e.target.style.borderColor = "#fecdd3"; }}
          />
          {errors.fullName && <p style={{ color: "#f43f5e", fontSize: "0.8rem", marginTop: "0.3rem", fontWeight: 600 }}>{errors.fullName}</p>}
        </div>

        {/* Số điện thoại & Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Số điện thoại *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="VD: 0912345678"
              style={inputStyle(errors.phone)}
              onFocus={e => { e.target.style.borderColor = "#e11d48"; }}
              onBlur={e => { if (!errors.phone) e.target.style.borderColor = "#fecdd3"; }}
            />
            {errors.phone && <p style={{ color: "#f43f5e", fontSize: "0.8rem", marginTop: "0.3rem", fontWeight: 600 }}>{errors.phone}</p>}
          </div>

          <div>
            <label style={labelStyle}>Email (tuỳ chọn)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="VD: email@example.com"
              style={inputStyle(false)}
              onFocus={e => { e.target.style.borderColor = "#e11d48"; }}
              onBlur={e => { e.target.style.borderColor = "#fecdd3"; }}
            />
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div>
          <label style={labelStyle}>Địa chỉ chi tiết *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="VD: Số nhà 123, Đường Lênin, Phường Bến Nghé, Quận 1, TP.HCM"
            style={inputStyle(errors.address)}
            onFocus={e => { e.target.style.borderColor = "#e11d48"; }}
            onBlur={e => { if (!errors.address) e.target.style.borderColor = "#fecdd3"; }}
          />
          {errors.address && <p style={{ color: "#f43f5e", fontSize: "0.8rem", marginTop: "0.3rem", fontWeight: 600 }}>{errors.address}</p>}
        </div>

        {/* Ghi chú */}
        <div>
          <label style={labelStyle}>Ghi chú cho cửa hàng (tuỳ chọn)</label>
          <textarea
            name="note"
            rows="3"
            value={formData.note}
            onChange={handleChange}
            placeholder="VD: Giao giờ hành chính, gọi trước khi đến, hoặc ghi chú lời chúc lên bánh..."
            style={{ ...inputStyle(false), resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = "#e11d48"; }}
            onBlur={e => { e.target.style.borderColor = "#fecdd3"; }}
          />
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <label style={labelStyle}>Phương thức thanh toán</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            {[
              { id: "cod", label: "💵 Tiền mặt (COD)", desc: "Thanh toán khi nhận" },
              { id: "banking", label: "🏦 Chuyển khoản", desc: "Quét mã QR Ngân hàng" },
              { id: "momo", label: "📱 Ví MoMo", desc: "Thanh toán qua MoMo" },
            ].map((pm) => (
              <div
                key={pm.id}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: pm.id }))}
                style={{
                  border: formData.paymentMethod === pm.id ? "2px solid #e11d48" : "1.5px solid #fecdd3",
                  background: formData.paymentMethod === pm.id ? "#fff5f7" : "#fff",
                  padding: "0.85rem",
                  borderRadius: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: formData.paymentMethod === pm.id ? "#9f1239" : "#374151" }}>
                  {pm.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.2rem" }}>
                  {pm.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút Đặt hàng */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "0.75rem",
            width: "100%",
            padding: "1.1rem",
            background: submitting ? "#f43f5e" : "linear-gradient(135deg, #f43f5e, #e11d48)",
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            fontSize: "1.1rem",
            fontWeight: 800,
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: "0 8px 24px rgba(225,29,72,0.35)",
            transition: "transform 0.2s, box-shadow 0.2s",
            opacity: submitting ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { if (!submitting) e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {submitting ? "⏳ ĐANG XỬ LÝ ĐƠN HÀNG..." : "XÁC NHẬN ĐẶT HÀNG →"}
        </button>
      </div>
    </form>
  );
}
