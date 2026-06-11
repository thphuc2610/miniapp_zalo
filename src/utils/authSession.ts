import { API_ENDPOINTS, buildApiUrl } from "config/api";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const AUTH_CONFIRMED_KEY = "tam_nhat_spa_auth_confirmed";

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const isAccessTokenUsable = (token?: string | null): token is string => {
  if (!token || token.trim().length === 0) return false;

  const payload = parseJwtPayload(token);
  if (!payload) return true;

  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (!exp) return true;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp > nowSeconds + 30;
};

export const clearStoredSession = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIRMED_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveStoredSession = (accessToken: string, refreshToken: string) => {
  memoryAccessToken = accessToken;
  memoryRefreshToken = refreshToken;
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIRMED_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getStoredAccessToken = () => {
  return memoryAccessToken;
};

export const getStoredRefreshToken = () => {
  return memoryRefreshToken;
};

export const hasStoredRefreshToken = () => Boolean(getStoredRefreshToken());

type RefreshSessionResult = {
  accessToken: string;
  refreshToken: string;
};

const unwrapSessionResponse = (payload: any, response: Response): RefreshSessionResult | null => {
  const data = payload?.data;
  const accessToken = data?.accessToken;
  const refreshToken = data?.refreshToken || response.headers.get("X-Refresh-Token") || getStoredRefreshToken();

  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
};

export const refreshStoredSession = async (refreshToken = getStoredRefreshToken()) => {
  if (!refreshToken) return null;

  const response = await fetch(buildApiUrl(API_ENDPOINTS.identity.refreshToken), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return null;

  const payload = await response.json().catch(() => null);
  return unwrapSessionResponse(payload, response);
};
