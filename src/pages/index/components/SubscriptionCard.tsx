import React, { FC } from "react";
import { followOA } from "zmp-sdk";
import MY_CONFIG from "../../../../mock/myapp_config.json";
import schoolLogo from "../../../static/logo.png";

export const SubscriptionCard: FC = () => {
  const handleFollowOA = async () => {
    try {
      await followOA({ id: MY_CONFIG.ID_OA });
    } catch (error) {
      console.error("Follow OA failed:", error);
    }
  };

  return (
    <div style={{ marginTop: 18, borderRadius: 18, border: "1px solid #d9e8f4", background: "#ffffff", padding: 15, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)", }}>
      <div style={{ fontSize: 14.5, color: "#334155", marginBottom: 13 }}>Quan tâm OA để nhận các thông báo mới nhất</div>

      <div style={{ height: 1, background: "#edf3f8", marginBottom: 13 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <img src={schoolLogo} alt="OA" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0", }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", lineHeight: 1.25 }}>Tâm Nhất Beauty & Healthy Spa</div>
        </div>

        <button
          onClick={handleFollowOA}
          style={{ border: "none", background: "#db2777", color: "#fff", borderRadius: 999, padding: "11px 18px", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 8px rgba(219, 39, 119, 0.2)", whiteSpace: "nowrap" }}>
          Quan tâm OA
        </button>
      </div>
    </div>
  );
};
