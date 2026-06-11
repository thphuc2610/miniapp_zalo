import React, { FC, useState, useEffect, useMemo } from "react";
import { Page, Header } from "zmp-ui";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { getSpaServices, getSpaMemberships, SpaService, SpaMembership } from "service/spaData";
import { quickBookingState } from "state";
import { buildAssetUrl } from "utils/common";
import { useAuthCheck } from "hooks/useAuthCheck";

import diamondCard from "../static/card/diamond.png";
import goldCard from "../static/card/gold.png";
import platinumCard from "../static/card/platinum.png";
import silverCard from "../static/card/silver.png";

const cardImages: Record<string, any> = {
  Silver: silverCard,
  Gold: goldCard,
  Platinum: platinumCard,
  Diamond: diamondCard,
  "Thẻ Bạc": silverCard,
  "Thẻ Vàng": goldCard,
  "Thẻ Kim Cương": diamondCard,
};

export const ServicesCatalogPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();

  const [services, setServices] = useState<SpaService[]>([]);
  const [memberships, setMemberships] = useState<SpaMembership[]>([]);
  const [loading, setLoading] = useState(true);

  // Read initial tab from URL query params
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "Tất cả";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const getCardImage = (title: string) => {
    for (const key in cardImages) {
      if (title.toLowerCase().includes(key.toLowerCase())) return cardImages[key];
    }
    return goldCard;
  };

  const openItemDetail = (item: any) => {
    navigate(`/detail/${item.type}/${item.id}`);
  };

  // Derived tabs from real categories + Nổi bật + Thẻ Member
  const dynamicTabs = useMemo(() => {
     const categories = new Set(services.map(s => s.group));
     return ["Tất cả", "Nổi bật", ...Array.from(categories), "Thẻ Member"].filter(Boolean);
  }, [services]);

  // Watch for tab parameter changes
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    Promise.all([getSpaServices(), getSpaMemberships()]).then(([svcs, mbrs]) => {
      setServices(svcs || []);
      setMemberships(mbrs || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const items = useMemo(() => {
    const allServices = services.map((s) => ({ ...s, isMembership: false, type: "service" }));
    const allMemberships = memberships.map((m) => ({ ...m, isMembership: true, type: "membership" }));

    let filtered: any[] = [];
    if (activeTab === "Tất cả") {
      filtered = [...allServices, ...allMemberships];
    } else if (activeTab === "Nổi bật") {
      filtered = allServices.filter(s => s.isFeatured);
    } else if (activeTab === "Thẻ Member") {
      filtered = allMemberships;
    } else {
      filtered = allServices.filter(s => s.group === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [activeTab, searchQuery, services, memberships]);

  if (loading) {
    return (
      <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="spinner" />
          <div style={{ color: "#be185d", fontWeight: 700, fontSize: 15 }}>Đang tải dịch vụ...</div>
        </div>
        <style>{`
          .spinner { width: 42px; height: 48px; border: 4px solid #fce7f3; border-top: 4px solid #be185d; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </Page>
    );
  }

  return (
    <Page style={{ overflowX: "hidden", paddingBottom: 80 }}>
      <Header title="Danh mục Dịch vụ" showBackIcon={false}
        style={{ fontSize: 17, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }} />

      <div style={{ background: "#fff", borderBottom: "1px solid #fce7f3", position: "sticky", top: 0, zIndex: 9, display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px", scrollbarWidth: "none" }}>
        {dynamicTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ border: "none", background: isActive ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : "#fdf2f8", color: isActive ? "#fff" : "#be185d", padding: "8px 16px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px 16px 4px", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", background: "#fdf2f8", borderRadius: 12, padding: "8px 12px", border: "1px solid #fbcfe8" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Tìm dịch vụ bạn muốn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1f2937", width: "100%", fontWeight: 600 }}
          />
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>✨</div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Đang cập nhật nội dung...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {items.map((item: any) => {
              const displayImage = item.isMembership ? getCardImage(item.title) : buildAssetUrl(item.image);
              
              return (
                <div
                  key={item.id}
                  onClick={() => openItemDetail(item)}
                  style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #fce7f3", boxShadow: "0 4px 12px rgba(131, 24, 67, 0.02)", display: "flex", flexDirection: "column", cursor: "pointer", position: "relative" }}
                >
                  <div style={{ position: "relative", width: "100%", height: 110, overflow: "hidden" }}>
                    <img src={displayImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {item.duration && !item.isMembership && (
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", color: "#fff", padding: "2px 6px", borderRadius: 6, fontSize: 9, fontWeight: 800 }}>
                        ⏱️ {item.duration}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 10, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ 
                        fontSize: 12.5, 
                        fontWeight: 700, 
                        color: "#1f2937", 
                        lineHeight: 1.35, 
                        height: 34, 
                        overflow: "hidden", 
                        display: "-webkit-box", 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: "vertical", 
                        marginBottom: 8 
                      }}>
                        {item.title}
                      </h3>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#be185d" }}>{item.price}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          checkAuth(() => {
                            setQuickBooking({
                              isOpen: true,
                              item: { id: item.id, title: item.title, price: item.price, image: item.isMembership ? displayImage : item.image },
                              actionType: "both"
                            });
                          }, {
                            icon: "cart",
                            reason: "Vui lòng đăng nhập để thêm dịch vụ vào giỏ hàng hoặc đặt lịch.",
                            redirectTo: `/detail/${item.type}/${item.id}`,
                          });
                        }}
                        style={{ border: "none", background: "#be185d", color: "#fff", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(190, 24, 93, 0.3)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
};

export default ServicesCatalogPage;
