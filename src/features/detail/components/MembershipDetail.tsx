import { SpaMembership } from "features/nguoidung/types/membership";
import React, { FC } from "react";


import diamondCard from "static/card/diamond.png";
import goldCard from "static/card/gold.png";
import platinumCard from "static/card/platinum.png";
import silverCard from "static/card/silver.png";

const cardImages: Record<string, any> = {
  Silver: silverCard,
  Gold: goldCard,
  Platinum: platinumCard,
  Diamond: diamondCard,
  "Thẻ Bạc": silverCard,
  "Thẻ Vàng": goldCard,
  "Thẻ Kim Cương": diamondCard,
};

interface MembershipDetailProps {
  item: SpaMembership;
  onOpenInquiry: () => void;
  onOpenBookingCart: () => void;
  onOpenBookingBuy: () => void;
}

export const MembershipDetail: FC<MembershipDetailProps> = ({ item, onOpenInquiry, onOpenBookingCart, onOpenBookingBuy }) => {
  const getCardImage = (title: string) => {
    for (const key in cardImages) {
      if (title.toLowerCase().includes(key.toLowerCase())) return cardImages[key];
    }
    return goldCard;
  };

  const imageSrc = item.image || getCardImage(item.title);

  return (
    <div className="membership-no-border" style={{ position: "relative", minHeight: "100%", paddingBottom: 120 }}>
      <div style={{ padding: 16 }}>
        <div style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.6/1",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(131, 24, 67, 0.2)",
          marginBottom: 20
        }}>
          <img src={imageSrc} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 16, border: "none", boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#831843", marginBottom: 12 }}>{item.title}</h1>

          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#4b5563", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>   
              <span style={{ color: "#9ca3af", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Thời hạn</span>
              <span style={{ fontWeight: 700, color: "#1f2937", display: "block" }}>{item.duration}</span>
            </div>
            <div style={{ width: 1, height: 24, background: "#e5e7eb", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>   
              <span style={{ color: "#9ca3af", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Áp dụng</span>
              <span style={{ fontWeight: 700, color: "#1f2937", display: "block" }}>Tất cả chi nhánh</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#831843", marginBottom: 8 }}>Về gói Membership</h3>
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.55, textAlign: "left" }}>
            {item.description}
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#831843", marginBottom: 12 }}>Đặc quyền thành viên</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(item.benefits || []).map((benefit, index) => ( 
              <div
                key={index}
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #fdf2f8 100%)",
                  borderRadius: 14,
                  padding: 12,
                  border: "none",       
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12
                , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
              >
                <div style={{
                  background: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)",
                  color: "#831843",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: 12
                }}>
                  {index + 1}
                </div>
                <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 700, lineHeight: 1.4 }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255, 255, 255, 0.95)",     
        backdropFilter: "blur(16px)",
        padding: "12px 16px calc(env(safe-area-inset-bottom) + 16px)",
        borderTop: "1px solid #fce7f3",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 20
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#be185d" }}>Giá: {item.price}</div>
        <div style={{ display: "flex", gap: 8 }}>    
          <button
            onClick={onOpenInquiry} style={{ flex: 1, background: "#fdf2f8", color: "#be185d", border: "none", padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>Tư vấn ngay</button>
          <button
            onClick={onOpenBookingBuy} style={{ flex: 1, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", color: "#fff", border: "none", padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>Đăng ký thẻ</button>
        </div>
      </div>
    </div>
  );
};
