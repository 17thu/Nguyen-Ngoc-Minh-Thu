"use client";
import Link from "next/link";
import { getTotalPrice } from "@/services/cartService";

/**
 * Câu 3. CartSummary Component
 *
 * Props:
 *   - cart       : mảng sản phẩm trong giỏ hàng
 *   - totalItems : (tùy chọn) tổng số lượng
 *   - totalPrice : (tùy chọn) tổng số tiền
 *   - onCheckout : hàm gọi khi nhấp "Thanh toán ngay"
 *
 * 
 *   - Tính tổng tiền giỏ hàng
 *   - Hiển thị tổng tiền và các nút điều hướng bên dưới/bên cạnh danh sách sản phẩm
 */
export default function CartSummary({ cart = [], totalItems, totalPrice, onCheckout }) {
  // Nếu không truyền totalItems/totalPrice từ context, tự tính dựa vào mảng cart
  const computedTotalItems = totalItems !== undefined
    ? totalItems
    : cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const computedTotalPrice = totalPrice !== undefined
    ? totalPrice
    : getTotalPrice(
      cart.map(item => ({
        ...item,
        price: item.is_on_sale && item.sale_price ? item.sale_price : item.price,
      }))
    );

  return (
    <div style={{
      background: "#fff",
      borderRadius: "1.5rem",
      border: "1.5px solid #fecdd3",
      padding: "1.5rem",
      boxShadow: "0 8px 30px rgba(225,29,72,0.08)",
    }}>
      <h3 style={{
        fontSize: "1.1rem",
        fontWeight: 800,
        color: "#881337",
        margin: "0 0 1.25rem 0",
        paddingBottom: "0.75rem",
        borderBottom: "2px solid #ffe4e6",
      }}>
        TỔNG ĐƠN HÀNG
      </h3>

      {/* Chi tiết tổng */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "#4b5563" }}>
          <span>Tổng số lượng:</span>
          <span style={{ fontWeight: 600, color: "#1f2937" }}>{computedTotalItems} sản phẩm</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "#4b5563" }}>
          <span>Phí vận chuyển:</span>
          <span style={{ color: "#10b981", fontWeight: 700 }}>Miễn phí ✨</span>
        </div>
        <div style={{
          borderTop: "1.5px dashed #fecdd3",
          paddingTop: "1rem",
          marginTop: "0.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1f2937" }}>Tổng cộng:</span>
          <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "#e11d48" }}>
            {Number(computedTotalPrice).toLocaleString("vi-VN")} ₫
          </span>
        </div>
      </div>

      {/* Nút hành động */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {typeof onCheckout === "function" ? (
          <button
            onClick={onCheckout}
            style={{
              width: "100%", padding: "1rem",
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              border: "none", borderRadius: "1rem",
              color: "#fff", fontWeight: 800, fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(225,29,72,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Thanh toán ngay →
          </button>
        ) : (
          <Link
            href="/checkout"
            style={{
              width: "100%", padding: "1rem", textAlign: "center",
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              border: "none", borderRadius: "1rem",
              color: "#fff", fontWeight: 800, fontSize: "1rem",
              textDecoration: "none", display: "block",
              boxShadow: "0 6px 20px rgba(225,29,72,0.3)",
            }}
          >
            Thanh toán ngay →
          </Link>
        )}

        <Link
          href="/products"
          style={{
            width: "100%", padding: "0.85rem", textAlign: "center",
            border: "1.5px solid #fecdd3", borderRadius: "1rem",
            color: "#e11d48", fontWeight: 700, fontSize: "0.9rem",
            textDecoration: "none", background: "#fff5f7",
            transition: "background 0.2s",
            display: "block",
          }}
        >
          ← Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
