import React, { FC } from "react";
import { Box, Button, Icon, Page } from "zmp-ui";
import { useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { loginPromptState } from "state";
import imgLogo from "../static/logo.png";

const NoAuth: FC = () => {
  const location = useLocation();
  const setLoginPrompt = useSetRecoilState(loginPromptState);

  const openLoginPrompt = () => {
    setLoginPrompt({
      visible: true,
      icon: "profile",
      title: "Yêu cầu đăng nhập",
      reason: "Vui lòng xác nhận để cấp quyền Zalo và tiếp tục sử dụng tính năng này.",
      redirectTo: `${location.pathname}${location.search}`,
    });
  };

  return (
    <Page style={{ minHeight: "100vh", background: "#fdf2f8" }}>
      <Box
        style={{
          minHeight: "100vh",
          padding: "120px 24px 32px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <img
          src={imgLogo}
          alt="Tâm Nhất Spa"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "contain",
            background: "#fff",
            padding: 18,
            boxShadow: "0 14px 34px rgba(190, 24, 93, 0.16)",
            margin: "0 auto 22px",
          }}
        />
        <div style={{ fontSize: 20, fontWeight: 800, color: "#831843", marginBottom: 8 }}>
          Vui lòng đăng nhập
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: "#6b7280", marginBottom: 24 }}>
          Bạn cần đăng nhập Zalo để xem thông tin cá nhân, giỏ hàng, đặt lịch và sử dụng dịch vụ.
        </div>
        <Button
          fullWidth
          size="large"
          onClick={openLoginPrompt}
          style={{
            height: 50,
            borderRadius: 16,
            background: "#be185d",
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          <Icon icon="zi-user" style={{ marginRight: 8 }} />
          Đăng nhập
        </Button>
      </Box>
    </Page>
  );
};

export default NoAuth;
