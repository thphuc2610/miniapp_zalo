import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import { Icon } from "zmp-ui";
import logo from "../../../static/logo.png";
import { selectedBranchState } from "state";

interface HeaderSectionProps {
  onOpenPicker: () => void;
}

export const HeaderSection: FC<HeaderSectionProps> = ({ onOpenPicker }) => {
  const selectedBranch = useRecoilValue(selectedBranchState);

  return (
    <div style={{ position: "relative", zIndex: 99, padding: "32px 16px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src={logo}
          alt="Logo Spa"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            objectFit: "cover",
            background: "#fff",
            padding: 2,
            boxShadow: "0 6px 14px rgba(15, 23, 42, 0.12)",
          }}
        />

        <div style={{ minWidth: 0, flex: 1 }}> 
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}> 
            Tâm Nhất Beauty & Healthy Spa   
          </div>

          <div
            onClick={onOpenPicker}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 6,
              cursor: "pointer",
              padding: "2px 0"
            }}
          >
            <Icon icon="zi-location" size={16} style={{ color: "#be185d" }} />
            <div style={{
              fontSize: 13, 
              color: "#1f2937",
              fontWeight: 700,
              textOverflow: "ellipsis",        
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: "180px",
              lineHeight: 1
            }}>
              {selectedBranch?.name || "Chọn chi nhánh..."}
            </div>
            <div style={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
              <Icon icon="zi-chevron-down" size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};