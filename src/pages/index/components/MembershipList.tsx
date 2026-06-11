import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { getSpaMemberships, SpaMembership } from "service/spaData";
import { quickBookingState } from "state";
import { useAuthCheck } from "hooks/useAuthCheck";

import diamondCard from "../../../static/card/diamond.png";
import goldCard from "../../../static/card/gold.png";
import platinumCard from "../../../static/card/platinum.png";
import silverCard from "../../../static/card/silver.png";

const cardImages: Record<string, any> = {
  Silver: silverCard,
  Gold: goldCard,
  Platinum: platinumCard,
  Diamond: diamondCard,
  "Thẻ Bạc": silverCard,
  "Thẻ Vàng": goldCard,
  "Thẻ Kim Cương": diamondCard,
};

export const MembershipList: FC = () => {
  const navigate = useNavigate();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();
  const [memberships, setMemberships] = useState<SpaMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpaMemberships().then((data) => {
      setMemberships(data);
      setLoading(false);
    });
  }, []);

  const getCardImage = (title: string) => {
    for (const key in cardImages) {
      if (title.toLowerCase().includes(key.toLowerCase())) return cardImages[key];
    }
    return goldCard;
  };


  if (!loading && memberships.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>Thẻ thành viên</div>
        <button
          onClick={() => navigate("/hangthanhvien")}
          style={{ border: "none", background: "#fdf2f8", color: "#be185d", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}
        >
          Tất cả
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} style={{ width: 180, height: 220, flexShrink: 0, background: "#fff", borderRadius: 18, border: "1px solid #fce7f3", padding: 12 }}>
              <div style={{ width: "100%", aspectRatio: "1.6/1", borderRadius: 10, background: "#f3f4f6", animation: "pulse 1.5s infinite ease-in-out" }} />
              <div style={{ width: "80%", height: 16, borderRadius: 4, background: "#f3f4f6", animation: "pulse 1.5s infinite ease-in-out", marginTop: 12 }} />
            </div>
          ))
        ) : (
          memberships.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/detail/membership/${item.id}`)}
              style={{ width: 220, flexShrink: 0, background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #fce7f3", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "1.6/1", overflow: "hidden" }}>
                <img src={getCardImage(item.title)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1f2937",
                    lineHeight: 1.3,
                    marginBottom: 8,
                    height: 34,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#be185d" }}>{item.price}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      checkAuth(
                        () => {
                          setQuickBooking({
                            isOpen: true,
                            item: { id: item.id, title: item.title, price: item.price, image: getCardImage(item.title) },
                            actionType: "cart",
                          });
                        },
                        {
                          icon: "cart",
                          reason: "Vui lòng đăng nhập để thêm thẻ thành viên vào giỏ hàng.",
                          redirectTo: `/detail/membership/${item.id}`,
                        },
                      );
                    }}
                    style={{ border: "none", background: "#be185d", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
