import { selectedUserLoginToken, refreshTokenState, ATOM_USER_INFO, phoneNumberAtom } from "features/xacthuc/state/auth.state";
import React, { FC, useEffect, useState } from "react";
import { useSnackbar } from "zmp-ui";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authorize, getAccessToken, getPhoneNumber, getSetting, getUserInfo, login } from "zmp-sdk";
import { ATOM_XIN_QUYEN, ATOM_DA_XIN_QUYEN } from "state";
import { loginZaloSilent, loginZaloFull } from "service/spaData";
import { saveStoredSession } from "utils/authSession";

const REQUIRED_SCOPES = ["scope.userInfo", "scope.userPhonenumber"] as const;

const hasRequiredScopes = (authSetting?: Partial<Record<string, boolean>>) =>
  REQUIRED_SCOPES.every((scope) => authSetting?.[scope] === true);

const refreshZaloSession = () =>
  new Promise<void>((resolve, reject) => {
    login({ success: () => resolve(), fail: reject });
  });

const getAccessTokenValue = async () => {
  const result: any = await getAccessToken();
  return typeof result === "string" ? result : result?.accessToken || "";
};

const getZaloUser = (info: any) => info?.userInfo || info || {};

const getErrorMessage = (error: any) => {
  const response = error?.response?.data;
  const message =
    response?.error?.message ||
    response?.message ||
    error?.message ||
    error?.error_message ||
    error?.msg;

  if (error?.code === 452) return "Phiên Zalo đã hết hạn. Vui lòng thử lại.";
  if (error?.code === -2001 || /decode id/i.test(String(message))) {
    return "Không giải mã được số điện thoại từ Zalo. Vui lòng đóng Mini App, mở lại đúng bản testing/production rồi thử lại.";
  }

  return message || "Vui lòng thử lại sau.";
};

export const XinquyenSheet: FC = () => {
  const [openSheet, setOpenSheet] = useRecoilState(ATOM_XIN_QUYEN);
  const [daXinQuyen, setDaXinQuyen] = useRecoilState(ATOM_DA_XIN_QUYEN);
  const setToken = useSetRecoilState(selectedUserLoginToken);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setUserInfo = useSetRecoilState(ATOM_USER_INFO);
  const setPhoneNumber = useSetRecoilState(phoneNumberAtom);

  const { openSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const saveSession = (session: any, info: any) => {
    setToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    saveStoredSession(session.accessToken, session.refreshToken);
    setUserInfo(info);

    const phone = session?.user?.phone || session?.user?.soDienThoai || session?.phone || session?.soDienThoai || "";
    if (phone) setPhoneNumber(String(phone));
  };

  const runAuthFlow = async (retryCount = 0): Promise<void> => {
    try {
      // Luôn đảm bảo đã gọi login() trước khi gọi các API khác của Zalo
      if (retryCount === 0) {
        try {
          await refreshZaloSession();
        } catch (loginError) {
          console.warn("Zalo login silent failed, tiếp tục...", loginError);
        }
      }

      const setting: any = await getSetting();
      if (!hasRequiredScopes(setting?.authSetting)) {
        await authorize({ scopes: [...REQUIRED_SCOPES] });
      }

      const accessToken = await getAccessTokenValue();
      if (!accessToken) throw new Error("Không lấy được Access Token từ Zalo.");

      const phoneRes: any = await getPhoneNumber();
      const phoneToken = phoneRes?.token;
      if (!phoneToken) throw new Error("Vui lòng cấp quyền số điện thoại.");

      const info: any = await getUserInfo();
      const zaloUser = getZaloUser(info);
      const profile = {
        phone: phoneRes?.number || phoneRes?.phoneNumber || null,
        fullName: zaloUser?.name || null,
        avatarUrl: zaloUser?.avatar || zaloUser?.picture?.data?.url || null,
        zaloUserId: zaloUser?.id || null,
      };

      const silentSession = await loginZaloSilent(accessToken, { zaloUserId: profile.zaloUserId });
      if (silentSession?.accessToken) {
        saveSession(silentSession, info);
        openSnackbar({ text: "Đăng nhập thành công!", type: "success" });
        return;
      }

      const fullSession = await loginZaloFull(accessToken, phoneToken, profile);
      if (!fullSession?.accessToken) throw new Error("Không thể xác thực với hệ thống.");

      saveSession(fullSession, info);
      openSnackbar({ text: "Xác thực thành công!", type: "success" });
    } catch (error: any) {
      if (retryCount < 1) {
        await refreshZaloSession();
        return runAuthFlow(retryCount + 1);
      }
      throw error;
    }
  };

  const CapQuyen = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await runAuthFlow();
    } catch (error: any) {
      console.error("Zalo Auth Error:", error?.response?.data || error);
      openSnackbar({ text: "Đăng nhập thất bại: " + getErrorMessage(error), type: "error" });
    } finally {
      setLoading(false);
      setOpenSheet(false);
      setDaXinQuyen(true);
    }
  };

  useEffect(() => {
    if (openSheet && !daXinQuyen && !loading) {
      void CapQuyen();
    }
  }, [openSheet, daXinQuyen, loading]);

  return null;
};
