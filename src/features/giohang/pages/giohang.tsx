import { cartState, checkoutState } from "features/datlich/state/booking.state";
import React, { FC, useState, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Page, useSnackbar, Header } from "zmp-ui";

import { useNavigate } from "react-router-dom";
import { CartItemRow } from "../components/CartItemRow";
import { isBookingDateTimeExpired } from "utils/common";

export const CartPage: FC = () => {
  const [cart, setCart] = useRecoilState(cartState); 
  const setCheckout = useSetRecoilState(checkoutState);
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (cart.length > 0 && selectedIndices.length === 0) {
      setSelectedIndices(cart.map((_, i) => i));     
    }
  }, [cart]);

  const handleDelete = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);

    setSelectedIndices((prev) =>
      prev
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
    );

    openSnackbar({ text: "Đã xóa dịch vụ khỏi giỏ hàng", type: "success" });
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item, idx) => {
      if (!selectedIndices.includes(idx)) return acc;
      // Handle price that might be "100.000 đ" string or number
      let priceVal = 0;
      if (typeof item.price === "number") {
        priceVal = item.price;
      } else {
        priceVal = parseInt(String(item.price || "0").replace(/\./g, "").replace(/[^0-9]/g, ""), 10);
      }
      const qty = item.quantity || 1;
      return acc + (isNaN(priceVal) ? 0 : priceVal * qty);
    }, 0);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const currentQty = updated[index].quantity || 1; 
    const newQty = Math.max(1, currentQty + delta);  
    updated[index] = { ...updated[index], quantity: newQty };
    setCart(updated);
  };

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const isAllSelected = cart.length > 0 && selectedIndices.length === cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(cart.map((_, i) => i));
    }
  };

  const handleCheckout = () => {
    if (selectedIndices.length === 0) {
      openSnackbar({ text: "Vui lòng chọn ít nhất một dịch vụ", type: "warning" });
      return;
    }
    const itemsToCheckout = cart.filter((_, idx) => selectedIndices.includes(idx));
    const expiredItem = itemsToCheckout.find((item) => isBookingDateTimeExpired(item.dateStr, item.time));
    if (expiredItem) {
      openSnackbar({ text: `Lịch hẹn của ${expiredItem.title || "dịch vụ"} đã qua, vui lòng chọn lại ngày giờ.`, type: "error" });
      return;
    }
    setCheckout({ items: itemsToCheckout });
    navigate("/thanhtoan");
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " đ";       
  };

  const subtotal = calculateSubtotal();
  const total = subtotal;

  return (
    <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Giỏ hàng & Lịch hẹn" showBackIcon={false}
        style={{ fontSize: 18, fontWeight: 700, textAlign: "center", background: "var(--color-2)" }} />   

      {!checkoutSuccess ? (
        cart.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 18 }}>🛒</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#831843", marginBottom: 6 }}>Giỏ hàng trống</h3>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 20 }}>
              Bạn chưa thêm dịch vụ nào vào giỏ hàng hoặc lịch hẹn. Trải nghiệm ngay các dịch vụ tuyệt vời tại Tâm Nhất Beauty Spa & Healthy!
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(190,24,93,0.3)"
              }}
            >
              Khám phá dịch vụ ngay
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",     
                background: "#fff",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(190, 24, 93, 0.28)",
                marginBottom: 2
              , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  onClick={toggleSelectAll}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: isAllSelected ? "none" : "2px solid #db2777",
                    background: isAllSelected ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",        
                  }}>
                    {isAllSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#831843" }}>Chọn tất cả ({cart.length})</span>
                </div>
              </div>

              {cart.map((item, idx) => (
                <CartItemRow
                  key={idx}
                  item={item}
                  idx={idx}
                  isSelected={selectedIndices.includes(idx)}
                  toggleSelect={toggleSelect}        
                  updateQuantity={updateQuantity}    
                  handleDelete={handleDelete}        
                />
              ))}
            </div>

            <div style={{
              background: "#fff",
              borderTop: "1px solid #fce7f3",        
              padding: "10px 16px 12px",
              marginBottom: "calc(72px + env(safe-area-inset-bottom))",
              boxSizing: "border-box",
              zIndex: 99,
              boxShadow: "0 -4px 12px rgba(131,24,67,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
                <span style={{ fontSize: 12.5, color: "#831843", fontWeight: 700, whiteSpace: "nowrap" }}>Tạm tính ({selectedIndices.length} dịch vụ):</span>
                <span style={{ fontWeight: 700, color: "#4b5563", fontSize: 13 }}>{formatPrice(subtotal)}</span>
              </div>

              <div style={{ height: "1px", background: "#f3f4f6" }} />

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",     
                gap: 10,
                padding: "2px 0"
              }}>
                <span style={{ fontSize: 12.5, color: "#831843", fontWeight: 700, whiteSpace: "nowrap" }}>
                  Tổng tiền:
                </span>

                <span style={{
                  color: "#be185d",
                  fontSize: 15,
                  fontWeight: 700,
                  flex: 1,
                  textAlign: "right",
                  whiteSpace: "nowrap"
                }}>
                  {formatPrice(total)}
                </span>

                <button
                  onClick={handleCheckout}
                  disabled={selectedIndices.length === 0}
                  style={{
                    width: 100,
                    height: 34,
                    background: selectedIndices.length === 0
                      ? "#d1d5db"
                      : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: selectedIndices.length === 0 ? "default" : "pointer",
                    boxShadow: selectedIndices.length === 0 ? "none" : "0 3px 8px rgba(190, 24, 93, 0.15)",
                    transition: "all 0.2s ease"      
                  }}
                >
                  Đặt lịch ({selectedIndices.length})     
                </button>
              </div>
            </div>
          </>
        )
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
          <div style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: "#fdf2f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            border: "3px solid #be185d"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="3"> 
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#831843", marginBottom: 10 }}>Đặt lịch thành công!</h2>
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginBottom: 24, padding: "0 8px" }}>
            Cảm ơn quý khách đã tin dùng dịch vụ của **Tâm Nhất Beauty & Healthy Spa**! <br />
            Lịch hẹn trị liệu của bạn đã được chuyển đến hệ thống đặt bàn. Đội ngũ lễ tân chuyên nghiệp sẽ liên hệ qua cuộc gọi Zalo để xác nhận lại trong vòng 5 phút.
          </p>

          <div style={{ display: "flex", gap: 10 }}> 
            <button
              onClick={() => navigate("/")}
              style={{
                background: "#be185d",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(190, 24, 93, 0.2)"
              }}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </Page>
  );
};

export default CartPage;
