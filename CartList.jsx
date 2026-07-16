"use client";
import CartItem from "./CartItem";

/**
 * CartList Component
 *
 * Props:
 *   - cartItems        : Array danh sách sản phẩm trong giỏ
 *   - onUpdateQuantity : (productId, newQty) => void
 *   - onRemove         : (productId) => void
 *
 * Nhiệm vụ: Render danh sách CartItem
 */
export default function CartList({ cartItems, onUpdateQuantity, onRemove }) {
  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "4rem 2rem",
        color: "#fda4af",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "#f43f5e" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
        <p style={{ fontWeight: 600, fontSize: "1.1rem", color: "#9f1239" }}>
          Giỏ hàng đang trống
        </p>
        <p style={{ fontSize: "0.875rem", color: "#fda4af", marginTop: "0.375rem" }}>
          Hãy thêm sản phẩm vào giỏ hàng!
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: "1rem", overflow: "hidden" }}>
      {cartItems.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
