import React, { FC, ReactNode } from "react";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  style?: React.CSSProperties;
};

export const EmptyState: FC<EmptyStateProps> = ({ title, description, action, style }) => (
  <div
    style={{
      padding: "28px 16px",
      textAlign: "center",
      color: "#64748b",
      ...style,
    }}
  >
    <div style={{ color: "#831843", fontSize: 15, fontWeight: 800, lineHeight: 1.35 }}>{title}</div>
    {description ? <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>{description}</div> : null}
    {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
  </div>
);

export default EmptyState;
