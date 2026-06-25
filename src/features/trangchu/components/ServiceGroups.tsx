import React, { FC, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";    
import { getSpaServices } from "service/spaData";
import { SpaService } from "features/danhmuc/types/service";
import { quickBookingState } from "features/datlich/state/booking.state";     
import { useAuthCheck } from "hooks/useAuthCheck";

export const ServiceGroups: FC = () => {       
  const navigate = useNavigate();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();        
  const [activeTab, setActiveTab] = useState("T\u1ea5t c\u1ea3");
  const [services, setServices] = useState<SpaService[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = useMemo(() => {
    const categories = new Set(services.map(s => s.group));
    return ["T\u1ea5t c\u1ea3", ...Array.from(categories)].filter(Boolean);
  }, [services]);

  useEffect(() => {
    getSpaServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  const filtered = activeTab === "T\u1ea5t c\u1ea3" ? services : services.filter((s) => s.group === activeTab);

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 4, height: 20, borderRadius: 999, background: "#be185d", display: "inline-block" }} /><div style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>{"D\u1ecbch v\u1ee5"}</div></div>    
        <div
          onClick={() => navigate(`/danhmuc?tab=${encodeURIComponent("T\u1ea5t c\u1ea3")}`)}
          style={{ fontSize: 12, fontWeight: 700, color: "#be185d", background: "#fdf2f8", padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(190, 24, 93, 0.28)", boxShadow: "var(--shadow-chip)", cursor: "pointer" }}
        >{"T\u1ea5t c\u1ea3"}</div>
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}  
            style={{
              border: activeTab === tab ? "1px solid #be185d" : "1px solid rgba(190, 24, 93, 0.28)",
                background: activeTab === tab ? "#be185d" : "#fdf2f8",
              color: activeTab === tab ? "#fff" : "#831843",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "var(--shadow-chip)"
}}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "stretch", gap: 12, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 220,
                flexShrink: 0,
                background: "#fff",
                borderRadius: 18,
                border: "1px solid rgba(190, 24, 93, 0.28)",   
                display: "flex",
                flexDirection: "column",       
                padding: 10,
                gap: 8
              }}
            >
              <div style={{ width: "100%", aspectRatio: "1.6/1", borderRadius: 12, background: "#f3f4f6", animation: "pulse 1.5s infinite ease-in-out" }} />
              <div style={{ width: "80%", height: 16, borderRadius: 4, background: "#f3f4f6", animation: "pulse 1.5s infinite ease-in-out" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: "20px 0", color: "#9ca3af", fontSize: 13, textAlign: "center", width: "100%" }}>{"\u0110ang c\u1eadp nh\u1eadt..."}</div>  
        ) : (
          filtered.map((svc) => (
            <div
              key={svc.id}
              onClick={() => navigate(`/detail/service/${svc.id}`)}
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
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
            >
              <img src={svc.image} alt={svc.title} style={{ width: "100%", aspectRatio: "1.6/1", objectFit: "cover", background: "#f3f4f6" }} />
              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1f2937",
                  lineHeight: 1.3,
                  marginBottom: 8,
                  flex: 1,
                  height: 34,
                  overflow: "hidden",
                  display: "-webkit-box",      
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"  
                }}>
                  {svc.title}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#be185d", lineHeight: 1, marginTop: 4 }}>{svc.price}</div>
                    <button
                      onClick={(e) => {        
                        e.stopPropagation();   
                        checkAuth(() => {      
                          setQuickBooking({    
                            isOpen: true,      
                            item: { id: svc.id, title: svc.title, price: svc.price, image: svc.image },
                            actionType: "cart" 
                          });
                        }, {
                          icon: "cart",
                          reason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 th\u00eam d\u1ecbch v\u1ee5 v\u00e0o gi\u1ecf h\u00e0ng.",
                          redirectTo: `/detail/service/${svc.id}`,
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
            </div>
          ))
        )}
      </div>
      <style>{` @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } } `}</style> 
    </div>
  );
};
