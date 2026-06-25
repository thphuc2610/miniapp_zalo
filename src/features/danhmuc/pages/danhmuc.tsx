import React, { FC, useState, useEffect, useMemo } from "react";
import { Page, Header } from "zmp-ui";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { getSpaServices, getSpaMemberships } from "service/spaData";
import { SpaService } from "features/danhmuc/types/service";
import { SpaMembership } from "features/nguoidung/types/membership";
import { quickBookingState } from "features/datlich/state/booking.state";
import { buildAssetUrl } from "utils/common";
import { useAuthCheck } from "hooks/useAuthCheck";

import diamondCard from "static/card/diamond.png";
import goldCard from "static/card/gold.png";
import platinumCard from "static/card/platinum.png";
import silverCard from "static/card/silver.png";

const text = {
  all: "T\u1ea5t c\u1ea3",
  featured: "N\u1ed5i b\u1eadt",
  member: "Th\u1ebb Member",
  silver: "Th\u1ebb B\u1ea1c",
  gold: "Th\u1ebb V\u00e0ng",
  diamond: "Th\u1ebb Kim C\u01b0\u01a1ng",
  loading: "\u0110ang t\u1ea3i d\u1ecbch v\u1ee5...",
  searchPlaceholder: "T\u00ecm d\u1ecbch v\u1ee5 b\u1ea1n mu\u1ed1n...",
  empty: "\u0110ang c\u1eadp nh\u1eadt n\u1ed9i dung...",
  loginReason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 th\u00eam d\u1ecbch v\u1ee5 v\u00e0o gi\u1ecf h\u00e0ng ho\u1eb7c \u0111\u1eb7t l\u1ecbch.",
};

const cardImages: Record<string, any> = {
  Silver: silverCard,
  Gold: goldCard,
  Platinum: platinumCard,
  Diamond: diamondCard,
  [text.silver]: silverCard,
  [text.gold]: goldCard,
  [text.diamond]: diamondCard,
};

export const ServicesCatalogPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();

  const [services, setServices] = useState<SpaService[]>([]);
  const [memberships, setMemberships] = useState<SpaMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || text.all;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const getCardImage = (title: string) => {
    for (const key in cardImages) {
      if (title.toLowerCase().includes(key.toLowerCase())) return cardImages[key];
    }
    return goldCard;
  };

  const openItemDetail = (item: any) => {
    navigate("/detail/" + item.type + "/" + item.id);
  };

  const dynamicTabs = useMemo(() => {
    const categories = new Set(services.map((s) => s.group));
    return [text.all, text.featured, ...Array.from(categories), text.member].filter(Boolean);
  }, [services]);

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [location.search]);

  useEffect(() => {
    Promise.all([getSpaServices(), getSpaMemberships()])
      .then(([svcs, mbrs]) => {
        setServices(svcs || []);
        setMemberships(mbrs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const items = useMemo(() => {
    const allServices = services.map((s) => ({ ...s, isMembership: false, type: "service" }));
    const allMemberships = memberships.map((m) => ({ ...m, isMembership: true, type: "membership" }));

    let filtered: any[] = [];
    if (activeTab === text.all) {
      filtered = [...allServices, ...allMemberships];
    } else if (activeTab === text.featured) {
      filtered = allServices.filter((s) => s.isFeatured);
    } else if (activeTab === text.member) {
      filtered = allMemberships;
    } else {
      filtered = allServices.filter((s) => s.group === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => item.title.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q)));
    }
    return filtered;
  }, [activeTab, searchQuery, services, memberships]);

  if (loading) {
    return (
      <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="spinner" />
          <div style={{ color: "#be185d", fontWeight: 700, fontSize: 15 }}>{text.loading}</div>
        </div>
        <style>{".spinner { width: 42px; height: 48px; border: 4px solid #fce7f3; border-top: 4px solid #be185d; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"}</style>
      </Page>
    );
  }

  return (
    <Page style={{ overflowX: "hidden", paddingBottom: 80 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--color-2)" }}>
      <Header
        showBackIcon={false}
        title="Danh mục"
        style={{ background: "var(--color-2)", paddingLeft: 16, paddingRight: 16, position: "relative", zIndex: 2 }}
      />

      <div style={{ background: "rgba(255, 247, 251, 0.96)", backdropFilter: "blur(10px)", borderBottom: "0.75px solid rgba(190, 24, 93, 0.16)", display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px", scrollbarWidth: "none", boxShadow: "var(--shadow-chip)" }}>
        {dynamicTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ border: isActive ? "0.75px solid rgba(190, 24, 93, 0.72)" : "0.75px solid rgba(190, 24, 93, 0.16)", background: isActive ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : "#fdf2f8", color: isActive ? "#fff" : "#be185d", padding: "8px 16px", borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease", boxShadow: "var(--shadow-chip)" }}>
              {tab}
            </button>
          );
        })}
      </div>
      </div>

      <div style={{ padding: 16 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>{"\u2728"}</div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>{text.empty}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {items.map((item: any) => {
              const displayImage = item.isMembership ? getCardImage(item.title) : buildAssetUrl(item.image);

              return (
                <div key={item.id} onClick={() => openItemDetail(item)} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "0.75px solid rgba(190, 24, 93, 0.16)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", cursor: "pointer", position: "relative" }}>
                  <div style={{ position: "relative", width: "100%", height: 110, overflow: "hidden" }}>
                    <img src={displayImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {item.duration && !item.isMembership && (
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", color: "#fff", padding: "2px 6px", borderRadius: 6, fontSize: 9, fontWeight: 800 }}>
                        {"\u23f1\ufe0f"} {item.duration}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 10, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: 12.5, fontWeight: 700, color: "#1f2937", lineHeight: 1.35, height: 34, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 8 }}>
                        {item.title}
                      </h3>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#be185d" }}>{item.price}</div>
                      <button onClick={(e) => { e.stopPropagation(); checkAuth(() => { setQuickBooking({ isOpen: true, item: { id: item.id, title: item.title, price: item.price, image: item.isMembership ? displayImage : item.image }, actionType: "both" }); }, { icon: "cart", reason: text.loginReason, redirectTo: "/detail/" + item.type + "/" + item.id }); }} style={{ border: "none", background: "#be185d", color: "#fff", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-button)" }}>
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
