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
