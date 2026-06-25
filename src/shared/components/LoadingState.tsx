import React, { FC, ReactNode } from "react";

type LoadingStateProps = {
  label?: ReactNode;
  style?: React.CSSProperties;
};

export const LoadingState: FC<LoadingStateProps> = ({ label = "Đang tải...", style }) => (
  <div
    style={{
      minHeight: 120,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      color: "#be185d",
      fontSize: 14,
      fontWeight: 800,
      ...style,
    }}
  >
    <div className="spinner" />
    <div>{label}</div>
  </div>
);

export default LoadingState;
