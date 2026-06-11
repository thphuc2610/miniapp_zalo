export interface SpaService {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  group: string;
  duration?: string;
  rating?: number;
  reviewsCount?: number;
  description: string;
  contentHtml?: string;
  benefits: string[];
  steps: { step: number; title: string; desc: string }[];
  isFeatured?: boolean;
}

export interface SpaCombo {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  duration?: string;
  rating?: number;
  reviewsCount?: number;
  description: string;
  benefits: string[];
  servicesIncluded: string[];
  steps: { step: number; title: string; desc: string }[];
}

export interface SpaMembership {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  duration: string;
  description: string;
  benefits: string[];
}

export interface SpaPromo {
  id: string;
  title: string;
  image: string;
  tag: string;
  expiryDate: string;
  description: string;
  promoCode: string;
  discountType?: "percent" | "amount" | string;
  discountValue?: number;
  minOrderAmount?: number | null;
  terms: string[];
  isOutOfStock?: boolean;
  remainingQuantity?: number;
}

export interface SpaArticle {
  id: string;
  title?: string;
  name?: string;
  summary?: string | null;
  description?: string | null;
  content?: string | null;
  contentHtml?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  categoryName?: string | null;
  typeName?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  status?: string | null;
}

export interface SpaAmenity {
  id: string;
  name: string;
  iconUrl: string;
  link?: string;
}

export interface SpaBanner {
  id: string;
  imageUrl: string;
  title?: string | null;
  link?: string | null;
}

export interface SpaBranch {
  id: string;
  name: string;
  address: string;
  hotline?: string;
  openingTime?: string;
  closingTime?: string;
}

export interface SpaTechnician {
  id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roleName?: string;
}

export interface CreateSpaBookingPayload {
  fullName: string;
  phone: string;
  avatarUrl?: string;
  email?: string;
  branchId: string;
  serviceIds: string[];
  scheduledStart: string;
  technicianId?: string | null;
  note?: string | null;
  totalPrice?: number | null;
  voucherCode?: string | null;
}

export interface SpaBooking {
  id: string;
  serviceIds: string[];
  serviceNames?: string[] | string | null;
  scheduledStart?: string | null;
  durationMinutes?: number | null;
  totalDurationMinutes?: number | null;
  status?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  branchAddress?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  technicianId?: string | null;
  technicianName?: string | null;
  note?: string | null;
  rating?: number | null;
  review?: string | null;
  createdAt?: string | null;
  totalPrice?: number | null;
}

export interface SpaReview {
  id?: string;
  customerName?: string | null;
  customerAvatar?: string | null;
  serviceName?: string | null;
  rating?: number | string | null;
  content?: string | null;
  comment?: string | null;
  createdAt?: string | null;
}

export interface CreateSpaReviewPayload {
  customerName: string;
  customerAvatar?: string | null;
  serviceName?: string | null;
  rating: number;
  content: string;
  status?: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};
