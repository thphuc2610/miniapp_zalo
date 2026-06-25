import { atom, selector } from "recoil";
import { getUserInfo, GetUserInfoReturns } from "zmp-sdk";
import { getStoredAccessToken, getStoredRefreshToken } from "utils/authSession";

export const ATOM_USER_INFO = atom<GetUserInfoReturns | null>({
  key: "ATOM_USER_INFO",
  default: null,
});

export const selectedUserLoginToken = atom<string | null>({
  key: "selectedUserLoginToken",
  default: getStoredAccessToken(),
});

export const refreshTokenState = atom<string | null>({
  key: "refreshTokenState",
  default: getStoredRefreshToken(),
});

export const userProfileState = atom<any | null>({
  key: "userProfileState",
  default: null,
});

export const phoneNumberAtom = atom<string>({
  key: "selectedPhoneNumber",
  default: "",
});

export const userState = selector({
  key: "user",
  get: async ({ get }) => {
    const token = get(selectedUserLoginToken);
    if (!token) return null;
    try {
        const { userInfo } = await getUserInfo({ avatarType: "small" });
        return userInfo;
    } catch {
        return null;
    }
  },
});
