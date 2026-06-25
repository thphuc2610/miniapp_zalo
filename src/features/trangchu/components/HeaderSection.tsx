import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import { Icon } from "zmp-ui";
import logo from "static/logo.png";
import { selectedBranchState } from "state";

interface HeaderSectionProps {
  onOpenPicker: () => void;
}

export const HeaderSection: FC<HeaderSectionProps> = ({ onOpenPicker }) => {
  const selectedBranch = useRecoilValue(selectedBranchState);

  return (
    <div style={{ position: "relative", zIndex: 99, padding: "60px 16px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src={logo}
          alt="Logo Spa"
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            objectFit: "cover",
            background: "#fff",
            padding: 3,
            border: "1px solid rgba(190, 24, 93, 0.16)",
            boxShadow: "0 10px 22px rgba(131, 24, 67, 0.12)",
          }}
        />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
            {"Tâm Nhất Beauty Spa & Healthy"}
          </div>

          <div
            onClick={onOpenPicker}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 7,
              cursor: "pointer",
              padding: "3px 9px 3px 6px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.66)",
              border: "1px solid rgba(190, 24, 93, 0.12)",
            }}
          >
            <Icon icon="zi-location" size={16} style={{ color: "#be185d" }} />
            <div
              style={{
                fontSize: 13,
                color: "#1f2937",
                fontWeight: 700,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                maxWidth: "180px",
                lineHeight: 1,
              }}
            >
              {selectedBranch?.name || "Ch\u1ecdn chi nh\u00e1nh..."}
            </div>
            <div style={{ color: "#be185d", display: "flex", alignItems: "center" }}>
              <Icon icon="zi-chevron-down" size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
