import { CreateSpaReviewPayload, SpaReview } from "features/danhgia/types/review";
import { SpaAmenity, SpaBanner } from "types/common";
import { SpaArticle } from "features/tintuc/types/article";
import { SpaMembership } from "features/nguoidung/types/membership";
import { SpaPromo } from "features/khuyenmai/types/promo";
import { SpaService } from "features/danhmuc/types/service";
import httpClient from "utils/httpclient";

import { buildAssetUrl } from "utils/common";
import { API_ENDPOINTS } from "utils/api";

type RawRecord = Record<string, unknown>;

const asRawArray = (value: unknown): RawRecord[] => Array.isArray(value) ? value as RawRecord[] : [];
const asString = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const asNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asNumberOrNull = (value: unknown) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (price: unknown) => {
  const p = asNumber(price);
  return p.toLocaleString("vi-VN") + " đ";
};

const isVoucherExpired = (validTo?: string | null) => {
  if (!validTo) return false;
  const expiry = new Date(validTo);
  return Number.isNaN(expiry.getTime()) ? false : expiry.getTime() < Date.now();
};

const normalizeService = (service: RawRecord): SpaService => ({
  id: asString(service.id),
  title: asString(service.name),
  price: formatPrice(service.price),
  image: buildAssetUrl(asString(service.imageUrl)),
  group: asString(service.categoryName, "Khác"),
  duration: service.durationMinutes ? `${asNumber(service.durationMinutes)} phút` : undefined,
  description: asString(service.description),
  contentHtml: asString(service.contentHtml),
  isFeatured: Boolean(service.isFeatured),
  benefits: [],
  steps: [],
});

const normalizePromo = (voucher: RawRecord): SpaPromo => {
  const usageLimit = typeof voucher.usageLimit === "number" ? voucher.usageLimit : null;
  const usedCount = asNumber(voucher.usedCount);
  const remainingQuantity = usageLimit != null ? Math.max(usageLimit - usedCount, 0) : undefined;
  const discountType = asString(voucher.discountType);
  const discountValue = asNumber(voucher.discountValue);

  return {
    id: asString(voucher.id),
    title: asString(voucher.name),
    image: buildAssetUrl(asString(voucher.imageUrl)),
    tag: discountType === "percent" ? `Giảm ${discountValue}%` : `Giảm ${formatPrice(discountValue)}`,
    expiryDate: asString(voucher.validTo),
    description: asString(voucher.description),
    promoCode: asString(voucher.code),
    discountType,
    discountValue,
    minOrderAmount: voucher.minOrderAmount == null ? null : asNumber(voucher.minOrderAmount),
    terms: [],
    remainingQuantity,
    isOutOfStock: remainingQuantity === 0,
  };
};

const normalizeMembership = (plan: RawRecord): SpaMembership => {
  const benefits = asString(plan.benefits);
  return {
    id: asString(plan.id),
    title: asString(plan.name),
    price: formatPrice(plan.price),
    image: "",
    duration: `${asNumber(plan.validityDays)} ngày`,
    description: benefits,
    benefits: benefits.split("\n").filter(Boolean),
  };
};

const normalizeAmenity = (amenity: RawRecord): SpaAmenity => ({
  id: asString(amenity.id),
  name: asString(amenity.name),
  iconUrl: asString(amenity.iconUrl),
  link: asString(amenity.link) || undefined,
});

const normalizeBanner = (banner: RawRecord): SpaBanner => ({
  id: asString(banner.id),
  imageUrl: asString(banner.imageUrl),
  title: asString(banner.title) || null,
  link: asString(banner.link) || null,
});

const normalizeArticle = (article: RawRecord): SpaArticle => ({
  id: asString(article.id),
  title: asString(article.title) || asString(article.tieuDe) || undefined,
  name: asString(article.name) || undefined,
  summary: asString(article.summary) || asString(article.moTaNgan) || null,
  description: asString(article.description) || null,
  content: asString(article.content) || asString(article.noiDung) || null,
  contentHtml: asString(article.contentHtml) || asString(article.noiDung) || null,
  imageUrl: asString(article.imageUrl) || asString(article.anhDaiDienUrl) || null,
  thumbnailUrl: asString(article.thumbnailUrl) || asString(article.anhDaiDienUrl) || null,
  coverImageUrl: asString(article.coverImageUrl) || asString(article.anhDaiDienUrl) || null,
  categoryName: asString(article.categoryName) || asString(article.tenLoai) || null,
  typeName: asString(article.typeName) || asString(article.tenLoai) || null,
  publishedAt: asString(article.publishedAt) || asString(article.ngayDang) || null,
  createdAt: asString(article.createdAt) || asString(article.ngayTao) || null,
  status: asString(article.status) || asString(article.trangThai) || null,
  viewCount: Number(article.viewCount) || Number(article.views) || Number(article.luotXem) || 0,
  authorName: asString(article.authorName) || asString(article.author) || asString(article.createdByName) || asString(article.tacGia) || null,
});

let cachedSpaServices: SpaService[] | null = null;

export const getSpaServices = async (): Promise<SpaService[]> => {
  if (cachedSpaServices) return cachedSpaServices;
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.services });
    if (res.data && res.data.success) {
      cachedSpaServices = asRawArray(res.data.data).map(normalizeService);
      return cachedSpaServices;
    }
    return [];
  } catch (error) {
    console.error("Fetch services failed:", error);
    return [];
  }
};

export const getSpaCombos = async (): Promise<unknown[]> => {
  return [];
};

export const getSpaPromos = async (): Promise<SpaPromo[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.vouchers });
    if (res.data && res.data.success) {
       return asRawArray(res.data.data)
         .filter(v => !isVoucherExpired(asString(v.validTo)))
         .map(normalizePromo);
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const checkSpaPromoCode = async (code: string): Promise<SpaPromo | null> => {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return null;

  try {
    const res = await httpClient.get({ url: `${API_ENDPOINTS.vouchers}/check/${encodeURIComponent(normalizedCode)}` });
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.error?.message || "Không tìm thấy mã ưu đãi phù hợp.");
    }

    return normalizePromo(res.data.data as RawRecord);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error?.message || error?.response?.data?.message || "Không tìm thấy mã ưu đãi phù hợp.");
  }
};

export const getSpaMemberships = async (): Promise<SpaMembership[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.membershipPlans });
    if (res.data && res.data.success) {
       return asRawArray(res.data.data).map(normalizeMembership);
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getSpaMembershipTiers = async (): Promise<RawRecord[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.membershipTiers });
    if (res.data && res.data.success) return asRawArray(res.data.data);
    return [];
  } catch (error) {
    return [];
  }
};

export const getSpaAmenities = async (): Promise<SpaAmenity[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.amenities, params: { isActive: true } });
    if (res.data && res.data.success) return asRawArray(res.data.data).map(normalizeAmenity);
    return [];
  } catch (error) {
    return [];
  }
};

export const getSpaBanners = async (): Promise<SpaBanner[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.banners, params: { isActive: true } });
    if (res.data && res.data.success) return asRawArray(res.data.data).map(normalizeBanner);
    return [];
  } catch (error) {
    return [];
  }
};

export const getSpaArticles = async (): Promise<SpaArticle[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.articles, params: { status: "published" } });
    if (res.data && res.data.success) return asRawArray(res.data.data).map(normalizeArticle);
    return [];
  } catch (error) {
    return [];
  }
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

export const getSpaSettings = async (): Promise<RawRecord | null> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.spaProfile });
    if (res.data && res.data.success) return res.data.data as RawRecord;
    return null;
  } catch (error) {
    return null;
  }
};
