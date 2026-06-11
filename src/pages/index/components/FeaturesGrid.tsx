import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ContactSupportModalState, userProfileState } from "state";
import { getSpaAmenities } from "service/spaData";
import { buildAssetUrl } from "utils/common";
import { useAuthCheck } from "hooks/useAuthCheck";

type AmenityItem = {
  id: string;
  name: string;
  iconUrl: string;
  link?: string;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase();

const isTechnicianRole = (roleName?: string | null) => {
  const normalized = normalizeText(roleName || "");
  return (
    normalized === "technician" ||
    normalized === "ktv" ||
    normalized.includes("ky thuat vien") ||
    normalized.includes("thuat vien") ||
    normalized.includes("technician")
  );
};

const isScheduleItem = (item: AmenityItem) => {
  const nameLower = normalizeText(item.name);
  return (
    item.link === "/thoi-khoa-bieu" ||
    nameLower.includes("thoi khoa bieu") ||
    nameLower.includes("lich lam viec")
  );
};

export const FeaturesGrid: FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthCheck();
  const setContactSupport = useSetRecoilState(ContactSupportModalState);
  const userProfile = useRecoilValue(userProfileState);
  const isTechnician = isTechnicianRole(userProfile?.roleName);
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);

  useEffect(() => {
    getSpaAmenities().then((data) => {
      if (data && data.length > 0) {
        setAmenities(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            iconUrl: buildAssetUrl(item.iconUrl),
            link: item.link,
          })).filter((item) => !isScheduleItem(item) || isTechnician),
        );
      }
    });
  }, [isTechnician]);

  const handleAction = (item: AmenityItem) => {
    const nameLower = normalizeText(item.name);
    const isAbout = nameLower.includes("gioi thieu") || nameLower.includes("ve chung toi");
    const isNews = nameLower.includes("tin tuc") || nameLower.includes("cam nang");
    const isContact = nameLower.includes("lien he");
    const isMembership = nameLower.includes("hang thanh vien") || nameLower.includes("thanh vien");
    const isHistory = nameLower.includes("lich su") || nameLower.includes("don");
    const isReview = nameLower.includes("danh gia");
    const isSchedule = isScheduleItem(item);
    const isPublic = isAbout || isNews || isContact || isMembership;

    const execute = () => {
      if (isAbout) {
        navigate("/gioithieu");
      } else if (isNews) {
        navigate("/tintuc");
      } else if (isMembership) {
        navigate("/hangthanhvien");
      } else if (isHistory) {
        navigate("/lichsudon");
      } else if (isContact) {
        setContactSupport(true);
      } else if (isReview) {
        navigate("/danhgia");
      } else if (isSchedule) {
        navigate("/thoi-khoa-bieu");
      } else if (item.link) {
        navigate(item.link);
      }
    };

    if (isPublic) {
      execute();
      return;
    }

    checkAuth(execute, {
      icon: isHistory ? "order" : isReview ? "profile" : "default",
      reason: isMembership
        ? "Vui lòng đăng nhập để xem hạng thành viên và quyền lợi cá nhân."
        : isHistory
          ? "Vui lòng đăng nhập để xem lịch sử đặt lịch và đơn hàng."
          : isReview
            ? "Vui lòng đăng nhập để gửi và xem đánh giá cá nhân."
            : isSchedule
              ? "Vui lòng đăng nhập tài khoản kỹ thuật viên để xem thời khóa biểu."
              : "Vui lòng đăng nhập để tiếp tục sử dụng tính năng này.",
      redirectTo: isMembership
        ? "/hangthanhvien"
        : isHistory
          ? "/lichsudon"
          : isReview
            ? "/danhgia"
            : isSchedule
              ? "/thoi-khoa-bieu"
              : item.link || "/",
    });
  };

  if (amenities.length === 0) return null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>Tiện ích</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          columnGap: 8,
          rowGap: 16,
          marginTop: 14,
        }}
      >
        {amenities.map((item) => (
          <button
            key={item.id}
            onClick={() => handleAction(item)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              textAlign: "center",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(148, 163, 184, 0.15)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                flexShrink: 0,
              }}
            >
              <img src={item.iconUrl} alt={item.name} style={{ width: 28, height: 28, objectFit: "contain" }} />
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "#1f2937",
                lineHeight: 1.2,
                height: 28,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.name}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};
