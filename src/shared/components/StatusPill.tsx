import React, { FC, ReactNode } from "react";

type StatusPillTone = "neutral" | "success" | "warning" | "danger" | "primary";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  dot?: boolean;
  style?: React.CSSProperties;
};

const toneStyles: Record<StatusPillTone, { color: string; background: string; border: string }> = {
  neutral: { color: "#475569", background: "#f8fafc", border: "#e2e8f0" },
  success: { color: "#047857", background: "#ecfdf5", border: "#bbf7d0" },
  warning: { color: "#b45309", background: "#fffbeb", border: "#fde68a" },
  danger: { color: "#be123c", background: "#fff1f2", border: "#fecdd3" },
  primary: { color: "#be185d", background: "#fdf2f8", border: "#fbcfe8" },
};

export const StatusPill: FC<StatusPillProps> = ({ children, tone = "neutral", dot = false, style }) => {
  const colors = toneStyles[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 24,
        padding: "4px 9px",
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        background: colors.background,
        color: colors.color,
        fontSize: 11.5,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.color }} /> : null}
      {children}
    </span>
  );
};

export default StatusPill;
