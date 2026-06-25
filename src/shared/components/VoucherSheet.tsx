import { SpaPromo } from "features/khuyenmai/types/promo";
import React, { FC, useEffect, useState } from "react";
import { Box, Icon, Sheet } from "zmp-ui";


interface VoucherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  promos?: SpaPromo[];
  selectedPromo: SpaPromo | null;
  onSelectPromo: (promo: SpaPromo | null) => void;
  searchResult?: SpaPromo | null;
  searchStatusText?: string;
  isSearching?: boolean;
  promoInput: string;
  onPromoInputChange: (val: string) => void;
  onApplyManualPromo: () => void;
}

const text = {
  title: "Chọn ưu đãi",
  placeholder: "Nhập mã trên voucher...",
  apply: "Áp dụng",
  searching: "Đang tìm ưu đãi...",
  notFound: "Không tìm thấy ưu đãi phù hợp.",
  remove: "Bỏ chọn",
  noMinOrder: "mọi đơn",
  noExpiry: "Không giới hạn",
  applyFrom: "áp dụng đơn từ",
};

const isVoucherExpired = (promo?: SpaPromo | null) => {
  if (!promo?.expiryDate) return false;
  const expiry = new Date(promo.expiryDate);
  return Number.isNaN(expiry.getTime()) ? false : expiry.getTime() < Date.now();
};

const formatMoney = (value?: number | null) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

const formatDate = (value?: string | null) => {
  if (!value) return text.noExpiry;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const getDiscountText = (promo: SpaPromo) => {
  const value = Number(promo.discountValue || 0);
  return promo.discountType === "percent" ? `Giảm ${value}%` : `Giảm ${formatMoney(value)}`;
};

export const VoucherSheet: FC<VoucherSheetProps> = ({
  isOpen,
  onClose,
  selectedPromo,
  onSelectPromo,
  searchResult,
  searchStatusText,
  isSearching,
  promoInput,
  onPromoInputChange,
  onApplyManualPromo,
}) => {
  const hasInput = Boolean(promoInput?.trim?.());
  const [lastVisiblePromo, setLastVisiblePromo] = useState<SpaPromo | null>(null);
  const candidateVoucher = hasInput ? searchResult : selectedPromo || lastVisiblePromo;
  const visibleVoucher = isVoucherExpired(candidateVoucher) ? null : candidateVoucher;

  useEffect(() => {
    if (selectedPromo && !isVoucherExpired(selectedPromo)) {
      setLastVisiblePromo(selectedPromo);
    } else if (searchResult && !isVoucherExpired(searchResult)) {
      setLastVisiblePromo(searchResult);
    }
  }, [searchResult, selectedPromo]);

  const renderVoucherRow = (promo: SpaPromo, options?: { selected?: boolean; onClick?: () => void }) => {
    const selected = Boolean(options?.selected);
    const minOrderText = promo.minOrderAmount ? formatMoney(promo.minOrderAmount) : text.noMinOrder;

    return (
      <div
        onClick={options?.onClick}
        style={{
          minHeight: 96,
          borderRadius: 12,
          border: selected ? "1px solid rgba(190, 24, 93, 0.45)" : "1px solid rgba(148, 163, 184, 0.22)",
          background: "#fff",
          display: "flex",
          alignItems: "stretch",
          cursor: options?.onClick ? "pointer" : "default",
          transition: "all 0.2s ease",
          overflow: "hidden",
          boxShadow: selected ? "0 6px 18px rgba(131, 24, 67, 0.08)" : "0 2px 8px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{
          width: 92,
          background: selected ? "#db2777" : "#be185d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
          padding: "10px 8px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: 1 }}>{promo.discountType === "percent" ? "%" : "đ"}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 7, lineHeight: 1.25 }}>{getDiscountText(promo)}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: "13px 10px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, lineHeight: 1.35 }}>
            <div style={{ color: "#be185d", fontWeight: 700 }}>
              {getDiscountText(promo)} {text.applyFrom} {minOrderText}
            </div>
            <div style={{ color: "#64748b", fontWeight: 700 }}>HSD: {formatDate(promo.expiryDate)}</div>
          </div>
        </div>

        <div style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {selected ? (
            <div style={{ color: "#be185d" }}>
              <Icon icon="zi-check-circle-solid" />
            </div>
          ) : (
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #cbd5e1", boxSizing: "border-box" }} />
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet visible={isOpen} onClose={onClose} mask handler autoHeight className="voucher-sheet">
      <Box p={4} style={{ background: "#fff", minHeight: "76vh", display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>{text.title}</h3>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            type="text"
            placeholder={text.placeholder}
            value={promoInput}
            onChange={(e) => onPromoInputChange(e.target.value.toUpperCase())}
            style={{
              flex: 1,
              border: "1px solid rgba(148, 163, 184, 0.24)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              fontWeight: 700,
              color: "#1e293b",
            }}
          />
          <button
            onClick={onApplyManualPromo}
            style={{
              background: "#be185d",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "0 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {text.apply}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(76vh - 148px)", overflowY: "auto", padding: "4px 0" }}>
          {hasInput && (
            <>
              {isSearching ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af" }}>{text.searching}</div>
              ) : !visibleVoucher ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", lineHeight: 1.5 }}>
                  {searchStatusText || text.notFound}
                </div>
              ) : (
                renderVoucherRow(visibleVoucher, {
                  selected: selectedPromo?.promoCode === visibleVoucher.promoCode,
                  onClick: () => {
                    if (selectedPromo?.promoCode === visibleVoucher.promoCode) onSelectPromo(null);
                    else onApplyManualPromo();
                  },
                })
              )}
            </>
          )}

          {!hasInput && visibleVoucher
            ? renderVoucherRow(visibleVoucher, {
                selected: selectedPromo?.promoCode === visibleVoucher.promoCode,
                onClick: () => onSelectPromo(selectedPromo?.promoCode === visibleVoucher.promoCode ? null : visibleVoucher),
              })
            : null}

          {selectedPromo && (
            <button
              onClick={() => onSelectPromo(null)}
              style={{ height: 44, border: "none", background: "#f1f5f9", color: "#475569", borderRadius: 12, fontSize: 14, fontWeight: 700 }}
            >
              {text.remove}
            </button>
          )}
        </div>
      </Box>
    </Sheet>
  );
};
