import React, { FC, useEffect, useState } from "react";
import { useSnackbar } from "zmp-ui";
import { useRecoilState, useSetRecoilState } from "recoil";
import { 
  authorize, 
  getAccessToken, 
  getPhoneNumber, 
  getUserInfo 
} from "zmp-sdk";
import { 
  ATOM_XIN_QUYEN, 
  selectedUserLoginToken, 
  refreshTokenState, 
  ATOM_USER_INFO, 
  ATOM_DA_XIN_QUYEN 
} from "state";
import { loginZaloSilent, loginZaloFull } from "service/spaData";

export const XinquyenSheet: FC = () => {
  const [openSheet, setOpenSheet] = useRecoilState(ATOM_XIN_QUYEN);
  const [daXinQuyen, setDaXinQuyen] = useRecoilState(ATOM_DA_XIN_QUYEN);
  const setToken = useSetRecoilState(selectedUserLoginToken);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setUserInfo = useSetRecoilState(ATOM_USER_INFO);
  
  const { openSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const saveSession = (accessToken: string, refreshToken: string) => {
    setToken(accessToken);
    setRefreshToken(refreshToken);
  };

  const CapQuyen = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // 1. Authorize scopes (userInfo and userPhonenumber)
      await authorize({ scopes: ["scope.userInfo", "scope.userPhonenumber"] });

      // 2. Get tokens from Zalo
      const accessToken = await getAccessToken();
      const phoneRes = await getPhoneNumber();
      const phoneToken = phoneRes?.token;
      const info = await getUserInfo();
      const zaloUser = (info as any)?.userInfo || info;
      const zaloProfile = {
        phone: (phoneRes as any)?.number || (phoneRes as any)?.phoneNumber || null,
        fullName: zaloUser?.name || null,
        avatarUrl: zaloUser?.avatar || null,
        zaloUserId: zaloUser?.id || null,
      };

      if (!accessToken) throw new Error("Không lấy được Access Token");

      // 3. Try Silent Login first (matches DHT logic of trying to login if registered)
      const silentRes = await loginZaloSilent(accessToken);
      if (silentRes && silentRes.accessToken) {
        saveSession(silentRes.accessToken, silentRes.refreshToken);
        setUserInfo(info);
        openSnackbar({ text: "Đăng nhập thành công!", type: "success" });
        setOpenSheet(false);
        setDaXinQuyen(true);
        return;
      }

      // 4. Register if silent login failed or phoneToken is needed
      if (!phoneToken) throw new Error("Vui lòng cấp quyền số điện thoại");

      const fullRes = await loginZaloFull(accessToken, phoneToken, zaloProfile);
      if (fullRes && fullRes.accessToken) {
        saveSession(fullRes.accessToken, fullRes.refreshToken);
        setUserInfo(info);
        openSnackbar({ text: "Xác thực thành công!", type: "success" });
        setOpenSheet(false);
        setDaXinQuyen(true);
      } else {
        throw new Error("Không thể xác thực với hệ thống");
      }
    } catch (error: any) {
      console.error("Zalo Auth Error:", error);
      openSnackbar({ text: error.message || "Xác thực thất bại", type: "error" });
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
