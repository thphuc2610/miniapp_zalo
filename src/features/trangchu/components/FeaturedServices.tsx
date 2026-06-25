import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";    
import { getSpaServices } from "service/spaData";
import { SpaService } from "features/danhmuc/types/service";
import { quickBookingState } from "features/datlich/state/booking.state";     
import { useAuthCheck } from "hooks/useAuthCheck";

export const FeaturedServices: FC = () => {    
  const navigate = useNavigate();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();        
  const [activeTab, setActiveTab] = useState("T\u1ea5t c\u1ea3");
  const [services, setServices] = useState<SpaService[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = ["T\u1ea5t c\u1ea3", ...new Set(services.map(s => s.group))].filter(Boolean);        

  useEffect(() => {
    getSpaServices().then((data) => {
      const featured = data.filter(s => s.isFeatured);
      setServices(featured);
      setLoading(false);
    });
  }, []);

  if (!loading && services.length === 0) return null;

  const filtered = activeTab === "T\u1ea5t c\u1ea3" ? services : services.filter((s) => s.group === activeTab);

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 4, height: 20, borderRadius: 999, background: "#be185d", display: "inline-block" }} /><div style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>{"D\u1ecbch v\u1ee5 n\u1ed5i b\u1eadt"}</div></div>
        <div
          onClick={() => navigate(`/danhmuc?tab=${encodeURIComponent("N\u1ed5i b\u1eadt")}`)}
          style={{ fontSize: 12, fontWeight: 700, color: "#be185d", background: "#fdf2f8", padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(190, 24, 93, 0.28)", boxShadow: "var(--shadow-chip)", cursor: "pointer" }}
        >{"T\u1ea5t c\u1ea3"}</div>
      </div>

      {tabs.length > 2 && (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: activeTab === tab ? "1px solid #be185d" : "1px solid rgba(190, 24, 93, 0.28)",
                background: activeTab === tab ? "#be185d" : "#fdf2f8",
                color: activeTab === tab ? "#fff" : "#831843",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.2s ease",
                boxShadow: "var(--shadow-chip)",
                cursor: "pointer"
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "stretch", gap: 12, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              style={{ width: 220, height: 222, flexShrink: 0, background: "#fff", borderRadius: 18, border: "1px solid rgba(190, 24, 93, 0.28)", padding: 0, overflow: "hidden", boxShadow: "var(--shadow-card)" }}
            >
              <div style={{ width: "100%", aspectRatio: "1.6/1", background: "#f3f4f6", animation: "pulse 1.5s infinite ease-in-out" }} />
              <div style={{ width: "80%", height: 16, borderRadius: 4, background: "#f3f4f6", animation: "pulse 1.5s infinite ease-in-out", marginTop: 8 }} />
            </div>
          ))
        ) : (
          filtered.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/detail/service/${service.id}`)}
              style={{
                width: 220,
                flexShrink: 0,
                background: "#fff",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "var(--shadow-card)",
                border: "1px solid rgba(190, 24, 93, 0.28)",   
                display: "flex",
                flexDirection: "column",       
                position: "relative",
                cursor: "pointer",
                transition: "transform 0.2s ease"
              }}
            >
              <div style={{
                position: "absolute",
                top: 8,
                left: 8,
                zIndex: 10,
                background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>{"N\u1ed4I B\u1eacT"}</div>

              <img src={service.image} alt={service.title} style={{ width: "100%", aspectRatio: "1.6/1", objectFit: "cover", background: "#f3f4f6" }} />
              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1f2937",
                  lineHeight: 1.3,
                  marginBottom: 8,
                  height: 34,
                  overflow: "hidden",
                  display: "-webkit-box",      
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"  
                }}>
                  {service.title}
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#be185d", lineHeight: 1, marginTop: 4 }}>{service.price}</div>
                    <button
                      onClick={(e) => {        
                        e.stopPropagation();   
                        checkAuth(() => {      
                          setQuickBooking({    
                            isOpen: true,      
                            item: { id: service.id, title: service.title, price: service.price, image: service.image },
                            actionType: "cart" 
                          });
                        }, {
                          icon: "cart",
                          reason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 th\u00eam d\u1ecbch v\u1ee5 v\u00e0o gi\u1ecf h\u00e0ng.",
                          redirectTo: `/detail/service/${service.id}`,
                        });
                      }}
                      style={{ border: "none", background: "#be185d", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "0 2px 4px rgba(190, 24, 93, 0.2)", cursor: "pointer" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{` @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } } `}</style> 
    </div>
  );
};
