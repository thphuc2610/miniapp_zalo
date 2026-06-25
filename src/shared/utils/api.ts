export const DEFAULT_API_BASE_URL = "https://api-tamnhatspa.titkul.com";
export const API_BASE_PATH = "/api";

export const getApiBaseUrl = () => {
  // Simulator (localhost) requires proxy to bypass CORS.
  // Real device (h5.zdn.vn / zapps) doesn't have proxy, so it must use absolute URL.
  const isSimulator = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    
  return isSimulator ? "" : DEFAULT_API_BASE_URL;
};

export const getAssetBaseUrl = () => {
  // Images don't have CORS issues, always use absolute URL
  return DEFAULT_API_BASE_URL;
};

export const buildApiPath = (path: string) =>
  `${API_BASE_PATH}/${path.replace(/^\/+/, "")}`;

export const buildApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
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
  articleView: (id: string) => buildApiPath(`articles/${id}/view`),
  spaProfile: buildApiPath("settings/spa-profile"),
  identity: {
    login: buildApiPath("identity/login"),
    zaloLogin: buildApiPath("identity/zalo-login"),
    zaloInfo: buildApiPath("identity/zalo-info"),
    refreshToken: buildApiPath("identity/refresh-token"),
    customerProfile: buildApiPath("identity/me/customer"),
  },
};
