import React, { FC, ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Box, Button, Icon, Input, Page } from "zmp-ui";
import { API_ENDPOINTS, buildApiUrl } from "config/api";
import { refreshTokenState, selectedUserLoginToken, userProfileState } from "state";
import imgLogo from "static/logo.png";
import { isAccessTokenUsable, saveStoredSession } from "utils/authSession";

const DEV_CUSTOMER_PHONE = "0375808385";

type LoginPageProps = {
  children?: ReactNode;
};

const LoginPage: FC<LoginPageProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useRecoilValue(selectedUserLoginToken);
  const setAccessToken = useSetRecoilState(selectedUserLoginToken);
  const setUserProfile = useSetRecoilState(userProfileState);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const [phone, setPhone] = useState(DEV_CUSTOMER_PHONE);
  const [password, setPassword] = useState(DEV_CUSTOMER_PHONE);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAccessTokenUsable(token) && children) {
    return <>{children}</>;
  }

  const submitLogin = async () => {
    if (!phone.trim() || !password.trim() || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.identity.login), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: phone.trim(),
          password: password.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);
      const data = payload?.data;
      const accessToken = data?.accessToken;
      const refreshToken = data?.refreshToken;

      if (!response.ok || !accessToken || !refreshToken) {
        setError(payload?.message || "Số điện thoại hoặc mật khẩu không đúng.");
        setIsSubmitting(false);
        return;
      }

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUserProfile(data.user);
      saveStoredSession(accessToken, refreshToken);
      navigate(`${location.pathname}${location.search}` || "/", { replace: true });
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <Page style={{ minHeight: "100vh", background: "#fff7ed" }}>
      <Box
        style={{
          minHeight: "100vh",
          padding: "96px 24px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <img
          src={imgLogo}
          alt="Tâm Nhất Spa"
          style={{
            width: 112,
            height: 112,
            borderRadius: 24,
            objectFit: "contain",
            background: "#fff",
            padding: 16,
            boxShadow: "0 16px 36px rgba(180, 83, 9, 0.16)",
            margin: "0 auto 22px",
          }}
        />
        <div style={{ fontSize: 22, fontWeight: 900, color: "#7c2d12", marginBottom: 8 }}>
          Đăng nhập Tâm Nhất Spa
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: "#6b7280", marginBottom: 24 }}>
          Vui lòng đăng nhập để xem cá nhân, giỏ hàng, đặt lịch và sử dụng các dịch vụ cần xác thực.
        </div>
        <Box style={{ display: "grid", gap: 12, marginBottom: 12, textAlign: "left" }}>
          <Input
            type="number"
            value={phone}
            placeholder="Số điện thoại"
            onChange={(event) => setPhone(event.target.value)}
          />
          <Input.Password
            value={password}
            placeholder="Mật khẩu"
            onChange={(event) => setPassword(event.target.value)}
          />
        </Box>
        {error && (
          <div style={{ color: "#dc2626", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            {error}
          </div>
        )}
        <Button
          fullWidth
          size="large"
          loading={isSubmitting}
          onClick={submitLogin}
          style={{
            height: 50,
            borderRadius: 14,
            background: "#be185d",
            color: "#fff",
            fontSize: 16,
            fontWeight: 900,
          }}
        >
          <Icon icon="zi-user" style={{ marginRight: 8 }} />
          Đăng nhập
        </Button>
      </Box>
    </Page>
  );
};

export default LoginPage;
