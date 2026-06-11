import React, { FC, ReactNode } from "react";
import { Header } from "zmp-ui";

type PageHeaderProps = {
  title: string;
  showBackIcon?: boolean;
  right?: ReactNode;
  style?: React.CSSProperties;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, showBackIcon = true, right, style }) => (
  <Header
    title={title}
    showBackIcon={showBackIcon}
    style={{
      background: "var(--color-2)",
      color: "#111827",
      fontSize: 18,
      fontWeight: 800,
      textAlign: "center",
      ...style,
    }}
    suffix={right}
  />
);

export default PageHeader;
