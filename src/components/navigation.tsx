import React, { FC, ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { openChat } from "zmp-sdk";
import { useAuthCheck } from "hooks/useAuthCheck";
import MY_CONFIG from "../../mock/myapp_config.json";

type TabKey = string;

type TabItem = {
  path: TabKey;
  label: string;
  icon: ReactNode;
};

const BookingCircleIcon: FC = () => (
  <div
    style={{
      width: 54,
      height: 54,
      minWidth: 54,
      minHeight: 54,
      maxWidth: 54,
      maxHeight: 54,
      borderRadius: "50%",
      background: "#be185d",
      border: "4px solid #fff",
      boxShadow: "0 10px 20px rgba(190, 24, 93, 0.22)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </div>
);

const NavIcon: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    style={{
      width: 26,
      height: 26,
      color: "inherit",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
    }}
  >
    {children}
  </div>
);

const tabs: TabItem[] = [
  {
    path: "/",
    label: "Trang chủ",
    icon: (
      <NavIcon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </NavIcon>
    ),
  },
  {
    path: "/danhmuc",
    label: "Dịch vụ",
    icon: (
      <NavIcon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        </svg>
      </NavIcon>
    ),
  },
  {
    path: "/datlich",
    label: "",
    icon: <BookingCircleIcon />,
  },
  {
    path: "/giohang",
    label: "Giỏ hàng",
    icon: (
      <NavIcon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </NavIcon>
    ),
  },
  {
    path: "/taikhoan",
    label: "Cá nhân",
    icon: (
      <NavIcon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </NavIcon>
    ),
  },
];

export const Navigation: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuthCheck();

  const activeTab = useMemo<string>(() => {
    if (location.pathname === "/") return "/";
    return tabs.find((tab) => tab.path !== "/" && location.pathname.startsWith(tab.path))?.path || "";
  }, [location.pathname]);

  const handleTabClick = (item: TabItem) => {  
    if (item.path === "/taikhoan") {
      navigate("/taikhoan");
      return;
    }

    // These tabs require login
    if (["/datlich", "/giohang"].includes(item.path)) {
      checkAuth(() => navigate(item.path), {
        icon: item.path === "/giohang" ? "cart" : "order",
        reason: item.path === "/giohang"
          ? "Vui lòng đăng nhập để sử dụng giỏ hàng."
          : "Vui lòng đăng nhập để đặt lịch dịch vụ.",
        redirectTo: item.path,
      });    
    } else {
      navigate(item.path);
    }
  };

  return (
    <div
      className="app-navigation"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "stretch",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map((item) => {
        const active = activeTab === item.path;

        return (
          <button
            key={item.path}
            onClick={() => handleTabClick(item)}
            style={{
              border: "none",
              background: "transparent",
              padding: "8px 4px 6px",
              minHeight: 72,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              color: active ? "#be185d" : "#7c8a9c",
              fontSize: 12,
              fontWeight: active ? 700 : 600,
              lineHeight: 1,
              position: "relative",
            }}
          >
            {item.icon}
            <span style={{ display: "block", lineHeight: 1.1, marginTop: item.path === "/" ? 2 : 0 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
