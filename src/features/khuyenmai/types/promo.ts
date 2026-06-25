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
