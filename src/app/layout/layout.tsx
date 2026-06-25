import React, { FC, Suspense, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import { Box } from "zmp-ui";
import { XinquyenSheet } from "components/xinquyen";
import HomePage from "features/trangchu/pages/index";
import NotificationPage from "features/thongbao/pages/notification";
import NouserPage from "features/xacthuc/pages/nouser";
import ProfilePage from "features/nguoidung/pages/profile";
import LoginPage from "features/xacthuc/pages/login";
import DetailPage from "features/detail/pages/detail";
import { ServicesCatalogPage } from "features/danhmuc/pages/danhmuc";
import { NewsPage } from "features/tintuc/pages/tintuc";
import { MembershipTiersPage } from "features/nguoidung/pages/hangthanhvien";
import { OrderHistoryPage } from "features/lichsudon/pages/lichsudon";
import { ClientReviewsPage } from "features/danhgia/pages/danhgia";
import PersonalInfoPage from "features/nguoidung/pages/thongtincanhan";
import QuenMatKhauPage from "features/xacthuc/pages/quenmatkhau";
import { PromosPage } from "features/khuyenmai/pages/khuyenmai";
import { DatlichPage } from "features/datlich/pages/datlich";
import CheckoutPage from "features/thanhtoan/pages/thanhtoan";
import TechnicianSchedulePage from "features/ktv/pages/thoi-khoa-bieu";

import { getSystemInfo } from "zmp-sdk";
import { ATOM_DA_XIN_QUYEN, loginPromptState } from "state";
import { ATOM_USER_INFO, phoneNumberAtom, refreshTokenState, selectedUserLoginToken } from "features/xacthuc/state/auth.state";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { clearStoredSession, isAccessTokenUsable, parseJwtPayload } from "utils/authSession";
import { Navigation } from "./navigation";
import GioiThieuPage from "features/gioithieu/pages/gioithieu";
import { CartPage } from "features/giohang/pages/giohang";
import ContactSupportModal from "components/ContactSupportModal";
import { QuickBookingSheet } from "components/QuickBookingSheet";
import { Auth } from "app/providers/Auth";
import LoginPromptModal from "components/Loginpromptmodal";
import { areRequiredZaloAuthScopesGranted } from "utils/zaloPermission";

if (getSystemInfo().platform === "android") {
  const androidSafeTop = Math.round(
    (window as any).ZaloJavaScriptInterface.getStatusBarHeight() / window.devicePixelRatio,
  );
  document.body.style.setProperty("--zaui-safe-area-inset-top", `${androidSafeTop}px`);
}

let hasCheckedReload = false;

export const Layout: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useRecoilValue(selectedUserLoginToken);
  const setToken = useSetRecoilState(selectedUserLoginToken);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setUserInfo = useSetRecoilState(ATOM_USER_INFO);
  const setPhoneNumber = useSetRecoilState(phoneNumberAtom);
  const setDaXinQuyen = useSetRecoilState(ATOM_DA_XIN_QUYEN);
  const isAuthenticated = isAccessTokenUsable(token);
  const showNav =
    ["/", "/danhmuc", "/giohang"].includes(location.pathname) ||
    (location.pathname === "/taikhoan" && isAuthenticated);
  const [loginPrompt, setLoginPrompt] = useRecoilState(loginPromptState);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const payload = parseJwtPayload(token);
    if (payload && payload.role_name && payload.role_name !== "Customer") {
      if (!hasCheckedReload) {
        hasCheckedReload = true;
        clearStoredSession();
        setToken(null);
        setRefreshToken(null);
        setUserInfo(null);
        setPhoneNumber("");
        return;
      }
      return; // Admin/Staff does not need Zalo scopes verification
    }
    hasCheckedReload = true;

    const verifyZaloScopes = async () => {
      const granted = await areRequiredZaloAuthScopesGranted();
      if (cancelled || granted) return;

      clearStoredSession();
      setToken(null);
      setRefreshToken(null);
      setUserInfo(null);
      setPhoneNumber("");
      setDaXinQuyen(false);
    };

    void verifyZaloScopes();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, setDaXinQuyen, setPhoneNumber, setRefreshToken, setToken, setUserInfo]);

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
