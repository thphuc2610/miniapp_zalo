import React, { FC, ReactNode } from "react";

type SectionTitleProps = {
  title: ReactNode;
  action?: ReactNode;
  style?: React.CSSProperties;
};

export const SectionTitle: FC<SectionTitleProps> = ({ title, action, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      margin: "24px 0 14px",
      ...style,
    }}
  >
    <div style={{ minWidth: 0, color: "#831843", fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>
      {title}
    </div>
    {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
  </div>
);

export default SectionTitle;
