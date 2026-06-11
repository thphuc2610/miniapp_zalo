export * from "../models/spa.types";
export * from "./serviceCatalog.service";

import { CreateSpaBookingPayload, CreateSpaReviewPayload, SpaBooking, SpaBranch, SpaReview, SpaTechnician } from "../models/spa.types";
import httpClient from "../utils/httpclient";
import { API_ENDPOINTS } from "config/api";
import {
  getSpaArticles,
  getSpaCombos,
  getSpaMemberships,
  getSpaPromos,
  getSpaServices,
} from "./serviceCatalog.service";

type RawRecord = Record<string, unknown>;
type HttpResponse = {
  data?: {
    success?: boolean;
    data?: unknown;
    error?: { message?: string };
    message?: string;
  };
  headers?: Record<string, unknown> | { get?: (name: string) => unknown };
};

const asRawArray = (value: unknown): RawRecord[] => Array.isArray(value) ? value as RawRecord[] : [];
const asString = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const asNullableString = (value: unknown) => typeof value === "string" && value ? value : null;
const asNumberOrNull = (value: unknown) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeAuthSession = (res: HttpResponse) => {
  const data = res.data?.data;
  if (!data || typeof data !== "object") return null;
  const session = data as RawRecord;
  const accessToken = asString(session.accessToken);
  const headerRefreshToken =
    res.headers && "get" in res.headers
      ? res.headers.get?.("x-refresh-token")
      : res.headers?.["x-refresh-token"];
  const refreshToken = asString(session.refreshToken) || asString(headerRefreshToken);

  if (!accessToken || !refreshToken) return null;
  return { ...session, accessToken, refreshToken };
};

export type CustomerProfile = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
};

export type UpdateCustomerProfilePayload = {
  fullName: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
};

const normalizeCustomerProfile = (item: RawRecord): CustomerProfile => ({
  id: asString(item.id),
  fullName: asString(item.fullName),
  avatarUrl: asNullableString(item.avatarUrl),
  phone: asString(item.phone),
  email: asNullableString(item.email),
  dateOfBirth: asNullableString(item.dateOfBirth),
  gender: asNullableString(item.gender),
});

const normalizeBranch = (branch: RawRecord): SpaBranch => ({
  id: asString(branch.id),
  name: asString(branch.name),
  address: asString(branch.address),
  hotline: asString(branch.phone) || asString(branch.hotline),
  openingTime: asString(branch.workingHours) || asString(branch.openingTime),
});

const normalizeTechnician = (user: RawRecord): SpaTechnician => ({
  id: asString(user.id),
  fullName: asString(user.fullName),
  roleName: asString(user.roleName),
  avatarUrl: asString(user.avatarUrl),
  phone: asString(user.phone),
});

const isTechnicianRole = (roleName?: string) => {
  const role = String(roleName || "").toLowerCase();
  return role === "kỹ thuật viên" || role === "technician" || role === "ktv" || role.includes("thuật viên");
};

const normalizeBooking = (booking: RawRecord): SpaBooking => ({
  id: asString(booking.id),
  serviceIds: Array.isArray(booking.serviceIds) ? booking.serviceIds.map(String) : [],
  serviceNames: Array.isArray(booking.serviceNames) ? booking.serviceNames.map(String) : asNullableString(booking.serviceNames),
  scheduledStart: asNullableString(booking.scheduledStart),
  durationMinutes: asNumberOrNull(booking.durationMinutes),
  totalDurationMinutes: asNumberOrNull(booking.totalDurationMinutes),
  status: asNullableString(booking.status),
  branchId: asNullableString(booking.branchId),
  branchName: asNullableString(booking.branchName),
  branchAddress: asNullableString(booking.branchAddress),
  customerName: asNullableString(booking.customerName),
  customerPhone: asNullableString(booking.customerPhone),
  customerEmail: asNullableString(booking.customerEmail) || asNullableString(booking.email),
  technicianId: asNullableString(booking.technicianId),
  technicianName: asNullableString(booking.technicianName),
  note: asNullableString(booking.note),
  rating: asNumberOrNull(booking.rating) ?? asNumberOrNull(booking.feedbackRating),
  review: asNullableString(booking.review) || asNullableString(booking.feedbackReview) || asNullableString(booking.comment),
  createdAt: asNullableString(booking.createdAt),
  totalPrice: asNumberOrNull(booking.totalPrice),
});

export const getCustomerProfile = async (): Promise<CustomerProfile | null> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.identity.customerProfile });
    const data = res.data?.data;
    return res.data?.success && data ? normalizeCustomerProfile(data as RawRecord) : null;
  } catch (error) {
    return null;
  }
};

export const updateCustomerProfile = async (payload: UpdateCustomerProfilePayload) => {
  try {
    const res = await httpClient.put({ url: API_ENDPOINTS.identity.customerProfile, data: payload });
    const data = res.data?.data;
    return {
      success: Boolean(res.data?.success),
      data: data ? normalizeCustomerProfile(data as RawRecord) : null,
      message: res.data?.error?.message || "",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error?.response?.data?.error?.message || "Không thể cập nhật thông tin.",
    };
  }
};

export const getSpaBranches = async (): Promise<SpaBranch[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.branches });
    if (res.data && res.data.success) {
      return asRawArray(res.data.data).map(normalizeBranch);
    }
    return [];
  } catch (error) {
    console.error("Fetch branches failed:", error);
    return [];
  }
};

export const getSpaTechnicians = async (): Promise<SpaTechnician[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.technicians });
    if (res.data && res.data.success) {
      return asRawArray(res.data.data).map(normalizeTechnician).filter(u => isTechnicianRole(u.roleName));
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getBusyTechnicianIds = async (payload: {
  branchId: string;
  scheduledStart: string;
  serviceIds: string[];
}): Promise<string[]> => {
  try {
    const params = new URLSearchParams();
    params.set("branchId", payload.branchId);
    params.set("scheduledStart", payload.scheduledStart);
    payload.serviceIds.forEach((id) => params.append("serviceIds", id));

    const res = await httpClient.get({ url: `${API_ENDPOINTS.busyTechnicians}?${params.toString()}` });
    const data = res.data?.data || [];
    return Array.isArray(data) ? data.map((id) => String(id)) : [];
  } catch (error) {
    console.error("Fetch busy technicians failed:", error);
    return [];
  }
};

export const createSpaBooking = async (payload: CreateSpaBookingPayload) => {
  try {
    const res = await httpClient.post({ url: API_ENDPOINTS.bookings, data: payload });
    if (res.data?.success) {
      return {
        success: true,
        ...res.data.data,
        bookingId: res.data.data?.id,
      };
    }
    return { success: false, message: res.data?.error?.message || "Không thể lưu lịch hẹn." };
  } catch (error: any) {
    return {
      success: false,
      fallback: true,
      message: error?.response?.data?.error?.message || error?.response?.data?.message || "Không thể kết nối hệ thống đặt lịch.",
    };
  }
};
export const getSpaBookings = async (): Promise<SpaBooking[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.bookingHistory });
    if (res.data && res.data.success) {
      return asRawArray(res.data.data).map(normalizeBooking);
    }
    return [];
  } catch (error) {
    console.error("Fetch bookings failed:", error);
    return [];
  }
};

// Step 1: Silent Login with AccessToken only  
export const loginZaloSilent = async (accessToken: string) => {
  try {
    const res = await httpClient.post({        
      url: API_ENDPOINTS.identity.zaloLogin,
      data: { accessToken }
    });
    return res.data?.success ? normalizeAuthSession(res) : null;
  } catch {
    return null;
  }
};

// Step 2: Full Login with AccessToken + PhoneToken
export const loginZaloFull = async (
  accessToken: string,
  phoneToken: string,
  profile?: { phone?: string | null; fullName?: string | null; avatarUrl?: string | null; zaloUserId?: string | null },
) => {
  try {
    const res = await httpClient.post({        
      url: API_ENDPOINTS.identity.zaloInfo,
      data: { accessToken, phoneToken, ...profile }        
    });
    return res.data?.success ? normalizeAuthSession(res) : null;
  } catch {
    return null;
  }
};
export const getSpaServiceById = async (id: string) => {
  const services = await getSpaServices();
  return services.find(s => s.id === id);      
};

export const getSpaComboById = async (id: string) => {
  const combos = await getSpaCombos();
  return combos.find(c => c.id === id);        
};

export const getSpaMembershipById = async (id: string) => {
  const plans = await getSpaMemberships();
  return plans.find(p => p.id === id);
};

export const getSpaPromoById = async (id: string) => {
  const promos = await getSpaPromos();
  return promos.find(p => p.id === id);        
};

export const getSpaArticleById = async (id: string) => {
  const articles = await getSpaArticles();
  return articles.find(a => a.id === id);      
};

export const getSpaReviews = async (): Promise<SpaReview[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.reviews });
    if (res.data && res.data.success) return asRawArray(res.data.data) as SpaReview[];
    return [];
  } catch (error) {
    return [];
  }
};

export const createSpaReview = async (data: CreateSpaReviewPayload) => {
  try {
    const res = await httpClient.post({ url: API_ENDPOINTS.reviews, data });
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

export const cancelSpaBooking = async (id: string) => {
  try {
    const res = await httpClient.post({ url: `${API_ENDPOINTS.bookings}/${id}/cancel`, data: {} });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.error?.message || error?.response?.data?.message || "Không thể kết nối hệ thống đặt lịch.",
    };
  }
};

export const submitSpaBookingFeedback = async (id: string, data: { rating: number; review?: string | null }) => {
  try {
    const res = await httpClient.post({ url: `${API_ENDPOINTS.bookings}/${id}/feedback`, data });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.error?.message || error?.response?.data?.message || "Không thể kết nối hệ thống đặt lịch.",
    };
  }
};
