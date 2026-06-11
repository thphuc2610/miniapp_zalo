import React, { FC, useEffect, useState } from "react";
import { Header, Page } from "zmp-ui";
import { openChat } from "zmp-sdk";
import MY_CONFIG from "../../mock/myapp_config.json";
import { getSpaMembershipTiers, getSpaPromos, SpaPromo } from "service/spaData";

const formatMoney = (value?: number | null) => Number(value || 0).toLocaleString("vi-VN");
const formatCurrency = (value?: number | null) => `${formatMoney(value)}đ`;

const formatVoucherDate = (value?: string | null) => {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const getVoucherDiscountText = (promo: SpaPromo) => {
  const value = Number(promo.discountValue || 0);
  return promo.discountType === "percent" ? `Giảm ${value}%` : `Giảm ${formatCurrency(value)}`;
};

const normalizeTierName = (name?: string) =>
  (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getTierRank = (name?: string) => {
  const normalizedName = normalizeTierName(name);
  if (normalizedName.includes("diamond") || normalizedName.includes("kim cuong")) return "diamond";
  if (normalizedName.includes("platinum") || normalizedName.includes("bach kim")) return "platinum";
  if (normalizedName.includes("gold") || normalizedName.includes("vang")) return "gold";
  if (normalizedName.includes("silver") || normalizedName.includes("bac")) return "silver";
  return "default";
};

const getTierTone = (name?: string) => {
  const rank = getTierRank(name);
  if (rank === "diamond") {
    return {
      background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 52%, #1e3a8a 100%)",
      border: "#7dd3fc",
      text: "#eff6ff",
      solid: "#2563eb",
    };
  }
  if (rank === "platinum") {
    return {
      background: "linear-gradient(135deg, #5eead4 0%, #0f766e 52%, #134e4a 100%)",
      border: "#99f6e4",
      text: "#f0fdfa",
      solid: "#0f766e",
    };
  }
  if (rank === "gold") {
    return {
      background: "linear-gradient(135deg, #fde047 0%, #f59e0b 52%, #b45309 100%)",
      border: "#fbbf24",
      text: "#fff7ed",
      solid: "#d97706",
    };
  }
  if (rank === "silver") {
    return {
      background: "linear-gradient(135deg, #d1d5db 0%, #aeb8c6 52%, #7d8998 100%)",
      border: "#cbd5e1",
      text: "#111827",
      solid: "#7d8998",
    };
  }
  return {
    background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
    border: "#f9a8d4",
    text: "#fff",
    solid: "#be185d",
  };
};

const RankIcon = ({ name, color = "currentColor" }: { name?: string; color?: string }) => {
  const rank = getTierRank(name);
  if (rank === "diamond") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 3.5h11L22 9l-10 12L2 9l4.5-5.5Z" />
        <path d="M2 9h20" />
        <path d="m8 9 4 12 4-12" />
        <path d="m6.5 3.5 1.5 5.5 4-5.5 4 5.5 1.5-5.5" />
      </svg>
    );
  }
  if (rank === "platinum") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z" />
        <path d="M12 6.5 16.5 9v6L12 17.5 7.5 15V9L12 6.5Z" />
      </svg>
    );
  }
  if (rank === "gold") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 20 7v5c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V7l8-4Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    );
  }
  if (rank === "silver") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 6.5v11" />
        <path d="M6.5 12h11" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 19 8v8l-7 5-7-5V8l7-5Z" />
      <path d="M9 12h6" />
    </svg>
  );
};

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CheckIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SheetFrame = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: "#fff",
        width: "100%",
        maxWidth: 480,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: "20px 16px 28px",
        boxSizing: "border-box",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 -6px 24px rgba(0,0,0,0.14)",
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>{title}</strong>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "#fdf2f8",
            color: "#831843",
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloseIcon />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const MembershipTiersPage: FC = () => {
  const [activeTier, setActiveTier] = useState<any>(null);
  const [promos, setPromos] = useState<SpaPromo[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [isVouchersSheetOpen, setIsVouchersSheetOpen] = useState(false);
  const [isPointHistoryOpen, setIsPointHistoryOpen] = useState(false);

  useEffect(() => {
    Promise.all([getSpaPromos(), getSpaMembershipTiers()]).then(([promoData, tierData]) => {
      setPromos(promoData || []);
      setTiers(tierData || []);
      if (tierData && tierData.length > 0) {
        setActiveTier(tierData[0]);
      }
    });
  }, []);

  const handleRegisterUpgrade = async () => {
    try {
      await openChat({
        type: "oa",
        id: MY_CONFIG.ID_OA,
        message: `Xin chào, tôi cần tư vấn về nâng cấp hạng thành viên (${activeTier?.name || "VIP"}).`,
      });
    } catch {
      if (typeof window !== "undefined") {
        window.open(`https://zalo.me/${MY_CONFIG.ID_OA}`, "_blank", "noopener,noreferrer");
      }
    }
  };

  const activeTone = getTierTone(activeTier?.name);

  return (
    <Page style={{ height: "100vh", background: "#fdf2f8", overflowY: "auto", overflowX: "hidden", paddingBottom: 80 }}>
      <Header
        title="Hạng thành viên"
        showBackIcon
        style={{ fontSize: 18, fontWeight: 700, textAlign: "center", background: "var(--color-2)" }}
      />

      <div style={{ padding: 16 }}>
        <section
          style={{
            background: activeTone.background,
            borderRadius: 16,
            padding: "18px 18px 16px",
            color: "#fff",
            boxShadow: "0 8px 20px rgba(131, 24, 67, 0.18)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, wordBreak: "break-word" }}>
                {activeTier?.name || "Khách hàng"}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>0 điểm</div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>
              <span>Tiến trình nâng hạng</span>
              <span>0%</span>
            </div>
            <div style={{ width: "100%", height: 7, background: "rgba(255,255,255,0.35)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: "0%", height: "100%", background: "#fff", borderRadius: 999 }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 700 }}>Điều kiện hạng</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Từ {formatCurrency(activeTier?.minSpend)}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 700 }}>Ưu đãi</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Giảm {activeTier?.discountPercentage || 0}%</div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 14,
            background: "#fff",
            borderRadius: 12,
            padding: "2px 14px",
            boxShadow: "0 4px 16px rgba(131,24,67,0.02)",
            border: "1px solid #fce7f3",
          }}
        >
          <button
            type="button"
            onClick={() => setIsPointHistoryOpen(true)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Lịch sử tích điểm</span>
            <ChevronIcon />
          </button>

          <button
            type="button"
            onClick={() => setIsVouchersSheetOpen(true)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Ưu đãi hiện có</span>
            <ChevronIcon />
          </button>
        </section>

        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#831843", marginBottom: 12 }}>Các hạng thành viên</div>

          {tiers.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px dashed #f9a8d4",
                borderRadius: 12,
                padding: "22px 16px",
                textAlign: "center",
                color: "#9f1239",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Đang cập nhật hạng thành viên.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #fce7f3",
                borderRadius: 12,
                padding: "16px 10px 14px",
                boxShadow: "0 4px 16px rgba(131,24,67,0.02)",
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {(() => {
                const activeIndex = Math.max(0, tiers.findIndex((tier) => tier.id === activeTier?.id));
                const progressWidth = tiers.length > 1 ? (activeIndex / (tiers.length - 1)) * 100 : 0;

                return (
              <div style={{ minWidth: Math.max(280, tiers.length * 76), position: "relative", padding: "0 8px" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 36,
                    right: 36,
                    top: 22,
                    height: 3,
                    background: "#fbcfe8",
                    borderRadius: 999,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 36,
                    top: 22,
                    height: 3,
                    width: `calc((100% - 72px) * ${progressWidth / 100})`,
                    maxWidth: "calc(100% - 72px)",
                    background: "#be185d",
                    borderRadius: 999,
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${tiers.length}, minmax(68px, 1fr))`, gap: 0, position: "relative" }}>
                  {tiers.map((tier, index) => {
                    const isSelected = activeTier?.id === tier.id;
                    const isReached = index <= activeIndex;
                    const tone = getTierTone(tier.name);

                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setActiveTier(tier)}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "0 4px",
                          textAlign: "center",
                          cursor: "pointer",
                          position: "relative",
                          minWidth: 68,
                        }}
                      >
                        <span
                          style={{
                            width: isSelected ? 48 : 42,
                            height: isSelected ? 48 : 42,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            background: isSelected ? tone.background : isReached ? tone.solid : "#fff",
                            border: isSelected ? `3px solid ${tone.border}` : `2px solid ${isReached ? tone.solid : "#fbcfe8"}`,
                            boxShadow: isSelected ? "0 8px 18px rgba(15,118,110,0.18)" : "0 3px 10px rgba(131,24,67,0.08)",
                            color: isReached || isSelected ? tone.text : tone.solid,
                            fontSize: 13,
                            fontWeight: 800,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <RankIcon name={tier.name} />
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: 8,
                            fontSize: 11.5,
                            lineHeight: 1.25,
                            color: isSelected ? "#831843" : "#6b7280",
                            fontWeight: 800,
                            minHeight: 30,
                          }}
                        >
                          {tier.name || "Hạng"}
                        </span>
                        <span style={{ display: "block", fontSize: 10.5, color: "#9ca3af", fontWeight: 700 }}>
                          Từ {formatCurrency(tier.minSpend)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
                );
              })()}
            </div>
          )}
        </section>

        {activeTier && (
          <section
            style={{
              marginTop: 22,
              padding: 16,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #fce7f3",
              boxShadow: "0 4px 16px rgba(131,24,67,0.02)",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>Quyền lợi hạng {activeTier.name}</h3>
            <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.45, marginBottom: 14 }}>
              {activeTier.description || "Nâng cấp hạng để nhận thêm nhiều ưu đãi từ Tâm Nhất Spa."}
            </p>

            <div
              style={{
                background: "#fdf2f8",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#be185d",
                marginBottom: 14,
                border: "1px solid #fbcfe8",
              }}
            >
              Đặc quyền: giảm {activeTier.discountPercentage || 0}% cho hóa đơn đủ điều kiện
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                `Tích lũy chi tiêu từ ${formatCurrency(activeTier.minSpend)}`,
                `Ưu đãi giảm giá ${activeTier.discountPercentage || 0}% trực tiếp`,
                `Tỷ lệ tích điểm cấu hình: ${activeTier.rewardRatePercent || 0}%`,
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div
                    style={{
                      background: "#fdf2f8",
                      color: "#be185d",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <CheckIcon />
                  </div>
                  <span style={{ fontSize: 12.5, color: "#4b5563", fontWeight: 700, lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <button
          onClick={handleRegisterUpgrade}
          style={{
            width: "100%",
            minHeight: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 18,
            padding: "0 14px",
            boxShadow: "0 4px 12px rgba(190,24,93,0.24)",
          }}
        >
          Đăng ký tư vấn nâng cấp hạng
        </button>
      </div>

      {isPointHistoryOpen && (
        <SheetFrame title="Lịch sử tích điểm" onClose={() => setIsPointHistoryOpen(false)}>
          <div style={{ textAlign: "center", padding: "32px 12px 26px", color: "#9ca3af" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fdf2f8", color: "#be185d", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 18, fontWeight: 700 }}>
              0
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#831843", marginBottom: 6 }}>Chưa có lịch sử tích điểm</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.45 }}>Phần này sẽ hiển thị sau khi có quy tắc tích điểm chính thức.</div>
          </div>
        </SheetFrame>
      )}

      {isVouchersSheetOpen && (
        <SheetFrame title="Ưu đãi hiện có" onClose={() => setIsVouchersSheetOpen(false)}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 10 }}>
            {promos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "34px 0", color: "#9ca3af", fontSize: 13, fontWeight: 700 }}>
                Hiện chưa có chương trình ưu đãi nào.
              </div>
            ) : (
              promos.map((promo) => (
                <div
                  key={promo.id}
                  style={{
                    border: "1px solid #fce7f3",
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "82px 1fr",
                    boxShadow: "0 2px 8px rgba(131,24,67,0.03)",
                  }}
                >
                  <div style={{ background: "#be185d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>ƯU ĐÃI</div>
                      <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>{promo.promoCode}</div>
                    </div>
                  </div>
                  <div style={{ padding: "11px 12px", minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "#1f2937", fontWeight: 700, lineHeight: 1.35 }}>
                      {getVoucherDiscountText(promo)} áp dụng đơn từ {promo.minOrderAmount ? formatCurrency(promo.minOrderAmount) : "mọi đơn"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, marginTop: 7 }}>HSD: {formatVoucherDate(promo.expiryDate)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetFrame>
      )}
    </Page>
  );
};

export default MembershipTiersPage;
