import React, { FC } from "react";
import { useSnackbar } from "zmp-ui";
import { SpaPromo } from "service/spaData";

interface PromoDetailProps {
  item: SpaPromo;
}

export const PromoDetail: FC<PromoDetailProps> = ({ item }) => {
  const { openSnackbar } = useSnackbar();

  const copyToClipboard = (text: string) => {        
    navigator.clipboard.writeText(text);
    openSnackbar({
      text: "Đã sao chép mã ưu đãi thành công! 🎉",
      type: "success",
      duration: 2000
    });
  };

  return (
    <div style={{ minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ padding: 16 }}>
        <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 20 }}>
          <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 12, left: 12, background: "#db2777", color: "#fff", fontSize: 11, fontWeight: 850, padding: "3px 10px", borderRadius: 8 }}>
            {item.tag}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 16, border: "1px solid #fbcfe8" }}>  
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#831843", lineHeight: 1.4 }}>{item.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 800, marginTop: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Hạn dùng: Hết ngày {item.expiryDate}</span>
          </div>

          <div style={{
            marginTop: 18,
            background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
            borderRadius: 14,
            padding: "14px 16px",
            border: "1px dashed #f472b6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span style={{ fontSize: 11, color: "#db2777", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Mã Ưu Đãi</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#831843", letterSpacing: 1 }}>{item.promoCode}</span>
            </div>
            <button
              onClick={() => copyToClipboard(item.promoCode)}
              style={{
                background: "#be185d",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(190, 24, 93, 0.2)"
              }}
            >
              Sao chép mã
            </button>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", marginBottom: 8 }}>Nội dung chi tiết</h3>
          <p style={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.6, textAlign: "left" }}>
            {item.description}
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", marginBottom: 12 }}>Điều kiện áp dụng</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {item.terms.map((term, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="3" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.4, fontWeight: 600 }}>{term}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
