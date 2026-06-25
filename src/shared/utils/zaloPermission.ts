import { getSetting } from "zmp-sdk";

export const REQUIRED_ZALO_AUTH_SCOPES = ["scope.userInfo", "scope.userPhonenumber"] as const;

export const hasRequiredZaloAuthScopes = (authSetting?: Partial<Record<string, boolean>>) =>
  REQUIRED_ZALO_AUTH_SCOPES.every((scope) => authSetting?.[scope] === true);

export const areRequiredZaloAuthScopesGranted = async () => {
  try {
    const setting: any = await getSetting();
    return hasRequiredZaloAuthScopes(setting?.authSetting);
  } catch {
    return true;
  }
};
