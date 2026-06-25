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

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};
