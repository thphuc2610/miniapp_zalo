export type RawRecord = Record<string, unknown>;

export type HttpResponse = {
  data?: {
    success?: boolean;
    data?: unknown;
    error?: { message?: string };
    message?: string;
  };
  headers?: Record<string, unknown> | { get?: (name: string) => unknown };
};

export const asRawArray = (value: unknown): RawRecord[] => Array.isArray(value) ? value as RawRecord[] : [];

export const asString = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;

export const asNullableString = (value: unknown) => typeof value === "string" && value ? value : null;

export const asNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const asNumberOrNull = (value: unknown) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatPrice = (price: unknown) => {
  const p = asNumber(price);
  return p.toLocaleString("vi-VN") + " d";
};

export const isVoucherExpired = (validTo?: string | null) => {
  if (!validTo) return false;
  const expiry = new Date(validTo);
  return Number.isNaN(expiry.getTime()) ? false : expiry.getTime() < Date.now();
};

export const normalizeAuthSession = (res: HttpResponse) => {
  const data = res.data?.data;
  if (!data || typeof data !== "object") return null;
  const session = data as RawRecord;
  const accessToken = asString(session.accessToken);
  const headerRefreshToken =
    res.headers && "get" in res.headers
      ? (res.headers as any).get?.("x-refresh-token")
      : (res.headers as any)?.["x-refresh-token"];
  const refreshToken = asString(session.refreshToken) || asString(headerRefreshToken);

  if (!accessToken || !refreshToken) return null;
  return { ...session, accessToken, refreshToken };
};
