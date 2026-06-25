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
