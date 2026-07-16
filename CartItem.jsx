"use client";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://127.0.0.1:8000/storage/";
const PLACEHOLDER = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&q=80";

/**
 * CartItem Component
 *
 * Props:
 *   - item             : Object sản phẩm trong giỏ { id, product_name, price, image, quantity, ... }
 *   - onUpdateQuantity : (productId, newQty) => void
 *   - onRemove         : (productId) => void
 *
 * Nhiệm vụ:
 *   - Hiển thị: Tên, Ảnh, Giá, Số lượng, Thành tiền
 *   - Cho phép: Tăng/Giảm số lượng, Xóa sản phẩm
 */
export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const imageUrl = item.image
    ? `${IMAGE_BASE_URL}${item.image}`
    : PLACEHOLDER;

  const unitPrice  = item.is_on_sale && item.sale_price ? item.sale_price : item.price;
  const totalPrice = unitPrice * item.quantity;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "1rem",
      padding: "1rem 1.25rem",
      borderBottom: "1px solid #fff1f2",
      background: "#fff",
      transition: "background 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "#fffbfc"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
    >
      {/* Ảnh sản phẩm */}
      <div style={{
        width: "4.5rem", height: "4.5rem", flexShrink: 0,
        borderRadius: "0.875rem", overflow: "hidden",
        border: "2px solid #fecdd3",
      }}>
        <img
          src={imageUrl}
          alt={item.product_name}
          onError={e => { e.target.src = PLACEHOLDER; }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Tên sản phẩm */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600, color: "#1f2937", fontSize: "0.9rem",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.product_name}
        </p>
        {/* Giá đơn vị */}
        <p style={{ fontSize: "0.8rem", color: "#fda4af", marginTop: "0.2rem" }}>
          Đơn giá: {Number(unitPrice).toLocaleString("vi-VN")} ₫
        </p>
      </div>

      {/* Bộ điều chỉnh số lượng */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        background: "#fff5f7", borderRadius: "9999px",
        padding: "0.25rem 0.5rem", border: "1px solid #fecdd3",
      }}>
        {/* Nút giảm */}
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          style={{
            width: "1.75rem", height: "1.75rem", borderRadius: "50%",
            border: "none", background: item.quantity <= 1 ? "#fecdd3" : "#e11d48",
            color: "#fff", fontSize: "1rem", fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          −
        </button>

        {/* Số lượng */}
        <span style={{
          minWidth: "2rem", textAlign: "center",
          fontWeight: 700, fontSize: "0.95rem", color: "#1f2937",
        }}>
          {item.quantity}
        </span>

        {/* Nút tăng */}
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          style={{
            width: "1.75rem", height: "1.75rem", borderRadius: "50%",
            border: "none", background: "#e11d48",
            color: "#fff", fontSize: "1rem", fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          +
        </button>
      </div>

      {/* Thành tiền */}
      <div style={{ minWidth: "6rem", textAlign: "right" }}>
        <p style={{ fontWeight: 700, color: "#e11d48", fontSize: "0.95rem" }}>
          {Number(totalPrice).toLocaleString("vi-VN")} ₫
        </p>
      </div>

      {/* Nút Xóa */}
      <button
        onClick={() => onRemove(item.id)}
        title="Xóa sản phẩm"
        style={{
          width: "2rem", height: "2rem", borderRadius: "50%", flexShrink: 0,
          border: "1px solid #fecdd3", background: "#fff",
          color: "#f43f5e", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s, color 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#f43f5e";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#f43f5e";
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  );
}
