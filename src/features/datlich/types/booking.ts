export interface CreateSpaBookingPayload {
  fullName: string;
  phone: string;
  avatarUrl?: string;
  email?: string;
  branchId: string;
  serviceIds: string[];
  scheduledStart: string;
  technicianId?: string | null;
  technicianIds?: string | null;
  note?: string | null;
  totalPrice?: number | null;
  voucherCode?: string | null;
  quantity?: number;
  guestCount?: number;
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
  technicianIds?: string | null;
  technicianNames?: string | null;
  note?: string | null;
  rating?: number | null;
  review?: string | null;
  createdAt?: string | null;
  totalPrice?: number | null;
  quantity?: number | null;
  guestCount?: number | null;
}
