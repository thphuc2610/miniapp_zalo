import React, { FC, useEffect, useState } from "react";
import { Header, Page, useSnackbar } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { getSpaPromos, SpaPromo } from "service/spaData";

const text = {
  copied: "Đã sao chép mã ưu đãi",
  loading: "Đang tải ưu đãi...",
  minOrder: "Đơn tối thiểu",
  validTo: "Hiệu lực",
  code: "Mã ưu đãi",
  copy: "Sao chép",
  noMinOrder: "mọi đơn",
  noExpiry: "Không giới hạn",
  applyFrom: "áp dụng đơn từ",
};

const formatMoney = (value?: number | null) => new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

const formatDate = (value?: string | null) => {
  if (!value) return text.noExpiry;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const getDiscountText = (promo: SpaPromo) => {
  const value = Number(promo.discountValue || 0);
  return promo.discountType === "percent" ? `Giảm ${value}%` : `Giảm ${formatMoney(value)}`;
};

export const PromosPage: FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  const [promos, setPromos] = useState<SpaPromo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpaPromos().then((res) => {
      setPromos(res || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    openSnackbar({
      text: `${text.copied}: ${code}`,
      type: "success",
    });
  };

  if (loading) {
    return (
      <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="spinner" />
          <div style={{ color: "#be185d", fontWeight: 800, fontSize: 15 }}>{text.loading}</div>
        </div>
        <style>{`
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #fce7f3;
            border-top: 4px solid #be185d;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Page>
    );
  }

  return (
    <Page style={{ height: "100vh", background: "#fdf2f8", overflowY: "auto", paddingBottom: 80 }}>
      <Header title="Voucher" showBackIcon={true}
        style={{ fontSize: 18, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }} />

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {promos.map((promo) => (
          <div
            key={promo.id}
            onClick={() => navigate(`/detail/promo/${promo.id}`)}
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid #fce7f3",
              boxShadow: "0 4px 16px rgba(131,24,67,0.03)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: 140, overflow: "hidden" }}>
              <img src={promo.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))" }} />
              <span style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#be185d",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                {promo.tag}
              </span>
              <div style={{ position: "absolute", bottom: 12, left: 12, color: "#fff", fontSize: 11, fontWeight: 800, opacity: 0.9 }}>
                HSD: {formatDate(promo.expiryDate)}
              </div>
            </div>

            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.45, marginBottom: 12, height: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {promo.description}
              </p>

              <div style={{ background: "#fff7fb", border: "1px solid #fce7f3", borderRadius: 10, padding: "8px 10px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 12, color: "#be185d", fontWeight: 800 }}>{getDiscountText(promo)} {text.applyFrom} {promo.minOrderAmount ? formatMoney(promo.minOrderAmount) : text.noMinOrder}</div>
                <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 700 }}>HSD: {formatDate(promo.expiryDate)}</div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fdf2f8",
                borderRadius: 12,
                padding: "8px 12px",
                border: "1px dashed #fbcfe8",
              }}>
                <div>
                  <div style={{ fontSize: 10, color: "#db2777", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{text.code}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#be185d", fontFamily: "monospace" }}>{promo.promoCode}</div>
                </div>

                <button
                  onClick={(e) => handleCopyCode(e, promo.promoCode)}
                  style={{
                    border: "none",
                    background: "#be185d",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(190, 24, 93, 0.2)",
                  }}
                >
                  {text.copy}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
};

export default PromosPage;
