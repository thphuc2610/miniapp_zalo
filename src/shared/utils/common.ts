import { openPhone } from 'zmp-sdk';
import { getAssetBaseUrl } from "utils/api";

export const USER_AUTH = 'USER_AUTH';
export const TOKEN = 'TOKEN';

export const ViewNumber = (num: number) => {
  return num.toLocaleString('en-GB');
};

export const callPhoneNumber = (phoneNum: string) => {
  openPhone({
    phoneNumber: phoneNum,
    fail: (error) => {
      console.error("Call failed:", error);        
    },
  });
};

export const buildAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = getAssetBaseUrl();
  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
};

export const getBookingDateTime = (dateStr?: string | null, time?: string | null) => {
  if (!dateStr || !time) return null;
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const date = new Date(`${dateStr}T${normalizedTime}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isBookingDateTimeExpired = (dateStr?: string | null, time?: string | null, now = new Date()) => {
  const bookingDateTime = getBookingDateTime(dateStr, time);
  return !bookingDateTime || bookingDateTime.getTime() <= now.getTime();
};
