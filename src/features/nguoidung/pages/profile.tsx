import { userProfileState } from "features/xacthuc/state/auth.state";
import React, { FC, useEffect, useState } from "react";
import { Header, Page } from "zmp-ui";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { AddressBookSheet } from "components/AddressBookSheet";
import { ContactSupportModalState } from "state";
import { getCustomerProfile, getSpaPromos } from "service/spaData";
import type { CustomerProfile } from "service/spaData";
import { SpaPromo } from "features/khuyenmai/types/promo";

const formatVoucherMoney = (value?: number | null) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))}đ`;

const formatVoucherDate = (value?: string | null) => {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const getVoucherDiscountText = (promo: SpaPromo) => {
  const value = Number(promo.discountValue || 0);
  return promo.discountType === "percent" ? `Giảm ${value}%` : `Giảm ${formatVoucherMoney(value)}`;
};

const voucherNoMinOrder = "mọi đơn";
const voucherApplyFrom = "áp dụng đơn từ";

const isTechnicianRole = (roleName?: string | null) => {
  const normalized = (roleName || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    normalized === "technician" ||
    normalized === "ktv" ||
    normalized.includes("ky thuat vien") ||
    normalized.includes("thuat vien") ||
    normalized.includes("technician")
  );
};

export const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const setContactSupport = useSetRecoilState(ContactSupportModalState);
  const userProfile = useRecoilValue(userProfileState);
  const isTechnician = isTechnicianRole(userProfile?.roleName);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [promos, setPromos] = useState<SpaPromo[]>([]);
  const [isVouchersSheetOpen, setIsVouchersSheetOpen] = useState(false);
  const [isAddressListSheetOpen, setIsAddressListSheetOpen] = useState(false);

  useEffect(() => {
    getCustomerProfile().then(setProfile);
    getSpaPromos().then((data) => setPromos(data || []));
  }, []);

  const userName = profile?.fullName || userProfile?.fullName || "Ng\u01b0\u1eddi d\u00f9ng";
  const userAvatar = profile?.avatarUrl || userProfile?.avatarUrl || "";

  const accountMenu = [
    {
      icon: <UserIcon />,
      title: "Th\u00f4ng tin c\u00e1 nh\u00e2n",
      subtitle: "C\u1eadp nh\u1eadt h\u1ed3 s\u01a1 v\u00e0 th\u00f4ng tin li\u00ean h\u1ec7",
      action: () => navigate("/thongtincanhan"),
    },
    {
      icon: <CalendarIcon />,
      title: "L\u1ecbch s\u1eed",
      subtitle: "Xem l\u1ecbch h\u1eb9n v\u00e0 \u0111\u01a1n h\u00e0ng \u0111\u00e3 t\u1ea1o",
      action: () => navigate("/lichsudon"),
    },
    {
      icon: <MapPinIcon />,
      title: "\u0110\u1ecba ch\u1ec9",
      subtitle: "Qu\u1ea3n l\u00fd \u0111\u1ecba ch\u1ec9 nh\u1eadn h\u00e0ng",
      action: () => setIsAddressListSheetOpen(true),
    },
    ...(isTechnician
      ? [
          {
            icon: <CalendarIcon />,
            title: "Th\u1eddi kh\u00f3a bi\u1ec3u",
            subtitle: "Theo d\u00f5i l\u1ecbch l\u00e0m vi\u1ec7c c\u00e1 nh\u00e2n",
            action: () => navigate("/thoi-khoa-bieu"),
          },
        ]
      : []),
  ];
  const benefitMenu = [
    {
      icon: <StarIcon />,
      title: "H\u1ea1ng th\u00e0nh vi\u00ean",
      subtitle: "Theo d\u00f5i h\u1ea1ng v\u00e0 quy\u1ec1n l\u1ee3i hi\u1ec7n c\u00f3",
      action: () => navigate("/hangthanhvien"),
    },
    {
      icon: <TagIcon />,
      title: "Voucher",
      subtitle: "M\u00e3 \u01b0u \u0111\u00e3i d\u00e0nh ri\u00eang cho b\u1ea1n",
      action: () => setIsVouchersSheetOpen(true),
    },
  ];
  const supportMenu = [
    {
      icon: <ReviewIcon />,
      title: "\u0110\u00e1nh gi\u00e1",
      subtitle: "G\u1eedi c\u1ea3m nh\u1eadn sau khi s\u1eed d\u1ee5ng d\u1ecbch v\u1ee5",
      action: () => navigate("/danhgia"),
    },
    {
      icon: <ChatIcon />,
      title: "Li\u00ean h\u1ec7",
      subtitle: "K\u1ebft n\u1ed1i nhanh v\u1edbi T\u00e2m Nh\u1ea5t",
      action: () => setContactSupport(true),
    },
    {
      icon: <InfoIcon />,
      title: "V\u1ec1 ch\u00fang t\u00f4i",
      subtitle: "Th\u00f4ng tin th\u01b0\u01a1ng hi\u1ec7u v\u00e0 chi nh\u00e1nh",
      action: () => navigate("/gioithieu"),
    },
  ];
  
  return (
    <Page className="page-shell" style={{ background: "#fdf2f8", minHeight: "100vh" }}>
      <Header
        showBackIcon={false}
        style={{ background: "var(--color-2)" }}
        title={
          (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px solid #fbcfe8",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#fdf2f8",
                }}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fce7f3",
                    }}
                  >
                    <UserIcon size={18} />
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1f2937",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userName}
                </div>
                {isTechnician && <div style={{ fontSize: 11, color: "#be185d", fontWeight: 700 }}>{"K\u1ef9 thu\u1eadt vi\u00ean"}</div>}
              </div>
            </div>
          ) as any
        }
      />

      <div style={{ padding: "0 16px 100px" }}>
        <MenuSection title="Tài khoản" items={accountMenu} />
        <MenuSection title="Ưu đãi" items={benefitMenu} />
        <MenuSection title="Hỗ trợ" items={supportMenu} />
      </div>

      {isVouchersSheetOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setIsVouchersSheetOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 480,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "24px 20px 30px",
              boxSizing: "border-box",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              boxShadow: "0 -6px 24px rgba(0,0,0,0.15)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>Voucher hiện có</strong>
              <button
                onClick={() => setIsVouchersSheetOpen(false)}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  color: "#4b5563",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 10 }}>
              {promos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 14, fontWeight: 600 }}>
                  Hiện chưa có chương trình ưu đãi nào.
                </div>
              ) : (
                promos.map((promo) => (
                  <div
                    key={promo.id}
                    style={{
                      border: "1.5px solid #fce7f3",
                      background: "#fff",
                      borderRadius: 16,
                      padding: "14px 16px",
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(131,24,67,0.02)",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "#be185d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      %
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ background: "#be185d", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                        {promo.promoCode}
                      </span>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, fontWeight: 600 }}>
                        Hạn sử dụng: {formatVoucherDate(promo.expiryDate)}
                      </div>
                      <div
                        style={{
                          background: "#fff7fb",
                          border: "1px solid #be185d",
                          borderRadius: 8,
                          padding: "6px 8px",
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3, boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
                      >
                        <div style={{ fontSize: 11, color: "#be185d", fontWeight: 700 }}>
                          {getVoucherDiscountText(promo)} {voucherApplyFrom}{" "}
                          {promo.minOrderAmount ? formatVoucherMoney(promo.minOrderAmount) : voucherNoMinOrder}
                        </div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 700 }}>HSD: {formatVoucherDate(promo.expiryDate)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AddressBookSheet visible={isAddressListSheetOpen} onClose={() => setIsAddressListSheetOpen(false)} mode="manage" />
    </Page>
  );
};

type MenuItem = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action: () => void;
};

const MenuSection: FC<{ title: string; items: MenuItem[] }> = ({ title, items }) => (
  <div style={{ marginTop: 16 }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
        paddingLeft: 4,
      }}
    >
      {title}
    </div>
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(190, 24, 93, 0.28)", boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)" }}>
      {items.map((item, index) => (
        <div
          key={item.title}
          onClick={item.action}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 16px",
            cursor: "pointer",
            borderBottom: index < items.length - 1 ? "1px solid #fdf2f8" : "none",
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {item.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}>{item.title}</div>
            {item.subtitle && <div style={{ marginTop: 3, fontSize: 11.5, fontWeight: 600, color: "#94a3b8", lineHeight: 1.35 }}>{item.subtitle}</div>}
          </div>
          <ChevronIcon />
        </div>
      ))}
    </div>
  </div>
);

const BaseIcon: FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const UserIcon: FC<{ size?: number }> = ({ size }) => (
  <BaseIcon size={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </BaseIcon>
);

const CalendarIcon = () => (
  <BaseIcon>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </BaseIcon>
);

const ReviewIcon = () => (
  <BaseIcon>
    <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8L6.8 19l1-5.8L3.6 9.1l5.8-.8L12 3z" />
    <path d="M20 21l-3-3" />
  </BaseIcon>
);

const StarIcon = () => (
  <BaseIcon>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </BaseIcon>
);

const TagIcon = () => (
  <BaseIcon>
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </BaseIcon>
);

const MapPinIcon = () => (
  <BaseIcon>
    <path d="M21 10c0 7-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </BaseIcon>
);

const ChatIcon = () => (
  <BaseIcon>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </BaseIcon>
);

const InfoIcon = () => (
  <BaseIcon>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
);

const FileIcon = () => (
  <BaseIcon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </BaseIcon>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default ProfilePage;
