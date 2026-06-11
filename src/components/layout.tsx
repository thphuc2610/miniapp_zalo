import React, { FC, Suspense, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import { Box } from "zmp-ui";
import { XinquyenSheet } from "./xinquyen";
import HomePage from "pages/index";
import NotificationPage from "pages/notification";
import NouserPage from "pages/nouser";
import ProfilePage from "pages/profile";
import LoginPage from "pages/login";
import DetailPage from "pages/detail";
import { ServicesCatalogPage } from "pages/danhmuc";
import { NewsPage } from "pages/tintuc";
import { MembershipTiersPage } from "pages/hangthanhvien";
import { OrderHistoryPage } from "pages/lichsudon";
import { ClientReviewsPage } from "pages/danhgia";
import PersonalInfoPage from "pages/thongtincanhan";
import QuenMatKhauPage from "pages/quenmatkhau";
import { PromosPage } from "pages/khuyenmai";
import { DatlichPage } from "pages/datlich";
import CheckoutPage from "pages/thanhtoan";
import TechnicianSchedulePage from "pages/thoi-khoa-bieu";

import { getSystemInfo } from "zmp-sdk";
import {
  loginPromptState,
  selectedUserLoginToken,
} from "state";
import { useRecoilValue, useRecoilState } from "recoil";
import { isAccessTokenUsable } from "utils/authSession";
import { Navigation } from "./navigation";
import GioiThieuPage from "pages/gioithieu";
import { CartPage } from "pages/giohang";
import ContactSupportModal from "components/ContactSupportModal";
import { QuickBookingSheet } from "./QuickBookingSheet";
import { Auth } from "./Auth";
import LoginPromptModal from "./Loginpromptmodal";

if (getSystemInfo().platform === "android") {
  const androidSafeTop = Math.round(
    (window as any).ZaloJavaScriptInterface.getStatusBarHeight() / window.devicePixelRatio,
  );
  document.body.style.setProperty("--zaui-safe-area-inset-top", `${androidSafeTop}px`);
}

export const Layout: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useRecoilValue(selectedUserLoginToken);
  const isAuthenticated = isAccessTokenUsable(token);
  const showNav =
    ["/", "/danhmuc", "/giohang"].includes(location.pathname) ||
    (location.pathname === "/taikhoan" && isAuthenticated);
  const [loginPrompt, setLoginPrompt] = useRecoilState(loginPromptState);

  useEffect(() => {
    if (!isAuthenticated || !loginPrompt.redirectTo || loginPrompt.visible) return;
    if (location.pathname === loginPrompt.redirectTo) return;

    const target = loginPrompt.redirectTo;
    setLoginPrompt((prev) => ({ ...prev, redirectTo: "" }));
    navigate(target, { replace: true });
  }, [isAuthenticated, loginPrompt.redirectTo, loginPrompt.visible, location.pathname, navigate, setLoginPrompt]);

  return (
    <Box flex flexDirection="column" className="h-screen">
      <Suspense
        fallback={
          <div
            className="loading"
            style={{
              fontWeight: 800,
              fontSize: "1.1em",
              color: "#123f6d",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(6px)",
            }}
          >
            Đang tải...
          </div>
        }
      >
        <Box className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nouser" element={<NouserPage />} />
            <Route path="/thongbao" element={<NotificationPage />} />
            <Route path="/taikhoan" element={<LoginPage><ProfilePage /></LoginPage>} />
            <Route path="/gioithieu" element={<GioiThieuPage />} />
            <Route path="/giohang" element={<Auth><CartPage /></Auth>} />
            <Route path="/danhmuc" element={<ServicesCatalogPage />} />
            <Route path="/tintuc" element={<NewsPage />} />
            <Route path="/hangthanhvien" element={<MembershipTiersPage />} />
            <Route path="/dangkythe" element={<Auth><MembershipTiersPage /></Auth>} />
            <Route path="/lichsudon" element={<Auth><OrderHistoryPage /></Auth>} />
            <Route path="/danhgia" element={<ClientReviewsPage />} />
            <Route path="/detail/:type/:id" element={<DetailPage />} />
            <Route path="/thongtincanhan" element={<Auth><PersonalInfoPage /></Auth>} />
            <Route path="/quenmatkhau" element={<QuenMatKhauPage />} />
            <Route path="/khuyenmai" element={<PromosPage />} />
            <Route path="/datlich" element={<Auth><DatlichPage /></Auth>} />
            <Route path="/thanhtoan" element={<Auth><CheckoutPage /></Auth>} />
            <Route path="/thoi-khoa-bieu" element={<Auth><TechnicianSchedulePage /></Auth>} />
          </Routes>
        </Box>
      </Suspense>
      {showNav && <Navigation />}
      <QuickBookingSheet />
      <ContactSupportModal />
      <LoginPromptModal
        visible={loginPrompt.visible}
        icon={loginPrompt.icon}
        title={loginPrompt.title}
        reason={loginPrompt.reason}
        onClose={() => setLoginPrompt((prev) => ({ ...prev, visible: false }))}
      />
      <XinquyenSheet />
    </Box>
  );
};
