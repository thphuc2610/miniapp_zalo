export { DEFAULT_API_BASE_URL, API_BASE_PATH } from "../../api.config";
import { DEFAULT_API_BASE_URL, API_BASE_PATH } from "../../api.config";

const getEnvValue = (key: string) => {
  const env = (import.meta as any).env || {};
  const value = env[key];
  return typeof value === "string" ? value.trim() : "";
};

export const getApiBaseUrl = () => {
  const envBaseUrl = getEnvValue("VITE_API_BASE_URL");
  const fallbackBaseUrl = (import.meta as any).env?.DEV ? "" : DEFAULT_API_BASE_URL;
  return (envBaseUrl || fallbackBaseUrl || "").replace(/\/+$/, "");
};

export const getAssetBaseUrl = () => getApiBaseUrl() || DEFAULT_API_BASE_URL;

export const buildApiPath = (path: string) =>
  `${API_BASE_PATH}/${path.replace(/^\/+/, "")}`;

export const buildApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};

export const API_ENDPOINTS = {
  branches: buildApiPath("branches"),
  technicians: buildApiPath("identity/technicians"),
  bookings: buildApiPath("bookings"),
  bookingHistory: buildApiPath("bookings/my-history"),
  busyTechnicians: buildApiPath("bookings/busy-technicians"),
  reviews: buildApiPath("reviews"),
  services: buildApiPath("services"),
  vouchers: buildApiPath("vouchers"),
  membershipPlans: buildApiPath("membership/plans"),
  membershipTiers: buildApiPath("membership/tiers"),
  amenities: buildApiPath("settings/amenities"),
  banners: buildApiPath("banners"),
  articles: buildApiPath("articles"),
  spaProfile: buildApiPath("settings/spa-profile"),
  identity: {
    login: buildApiPath("identity/login"),
    zaloLogin: buildApiPath("identity/zalo-login"),
    zaloInfo: buildApiPath("identity/zalo-info"),
    refreshToken: buildApiPath("identity/refresh-token"),
    customerProfile: buildApiPath("identity/me/customer"),
  },
};
