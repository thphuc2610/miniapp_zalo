import React, { FC, useState } from "react";
import { followOA } from "zmp-sdk";
import MY_CONFIG from "../../../../mock/myapp_config.json";

export const SubscriptionCard: FC = () => {
  const [isFollowed, setIsFollowed] = useState(false);

  const handleFollowOA = async () => {
    if (isFollowed) return;
    try {
      await followOA({ id: MY_CONFIG.ID_OA });
      setIsFollowed(true);
    } catch (error) {
      console.error("Follow OA failed:", error);
    }
  };

  return (
    <div
      style={{
        margin: "18px 4px 0",
        borderRadius: 18,
        border: "1px solid rgba(190, 24, 93, 0.22)",
        background: "linear-gradient(135deg, #fff 0%, #fff1f7 48%, #fce7f3 100%)",
        padding: "16px 14px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 112,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -34,
          right: -28,
          width: 108,
          height: 108,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(219, 39, 119, 0.16) 0%, rgba(219, 39, 119, 0) 68%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -42,
          left: -34,
          width: 118,
          height: 118,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251, 207, 232, 0.75) 0%, rgba(251, 207, 232, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 850, color: "#831843", lineHeight: 1.3, whiteSpace: "normal" }}>
          Tâm Nhất Beauty Spa & Healthy
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(190, 24, 93, 0.22), rgba(190, 24, 93, 0.06))", margin: "10px 0" }} />
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748b", lineHeight: 1.35, whiteSpace: "normal" }}>
          Nhận ưu đãi và thông báo mới.
        </div>
      </div>

      <button 
        type="button" 
        onClick={handleFollowOA} 
        disabled={isFollowed}
        style={{ 
          border: "none", 
          background: isFollowed ? "linear-gradient(135deg, #9d174d 0%, #831843 100%)" : "linear-gradient(135deg, #db2777 0%, #be185d 100%)", 
          color: "#fff", 
          opacity: isFollowed ? 0.8 : 1,
          borderRadius: 999, 
          padding: "10px 13px", 
          fontSize: 12.5, 
          fontWeight: 850, 
          boxShadow: isFollowed ? "none" : "var(--shadow-button)", 
          whiteSpace: "nowrap", 
          flexShrink: 0, 
          position: "relative", 
          zIndex: 1,
          cursor: isFollowed ? "not-allowed" : "pointer"
        }}
      >
        {isFollowed ? "Đã quan tâm" : "Quan tâm OA"}
      </button>
    </div>
  );
};
