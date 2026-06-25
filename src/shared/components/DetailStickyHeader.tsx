import React, { FC, ReactNode } from "react";

type DetailStickyHeaderProps = {
  title: ReactNode;
  visible?: boolean;
  onBack?: () => void;
  right?: ReactNode;
};

export const DetailStickyHeader: FC<DetailStickyHeaderProps> = ({ title, visible = true, onBack, right }) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      gap: 10,
      minHeight: 48,
      padding: "6px 12px",
      background: visible ? "var(--color-2)" : "transparent",
      color: "#111827",
      transition: "background 0.2s ease, box-shadow 0.2s ease",
      boxShadow: visible ? "0 1px 0 rgba(15,23,42,0.06)" : "none",
    }}
  >
    <button
      type="button"
      onClick={onBack}
      aria-label="Quay lại"
      style={{
        width: 34,
        height: 34,
        border: "none",
        borderRadius: 17,
        background: "rgba(255,255,255,0.8)",
        color: "#111827",
        fontSize: 20,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      ‹
    </button>
    <div
      style={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: 15,
        fontWeight: 800,
      }}
    >
      {title}
    </div>
    {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
  </div>
);

export default DetailStickyHeader;
