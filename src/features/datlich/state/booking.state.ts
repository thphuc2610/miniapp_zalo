import { atom, AtomEffect } from "recoil";

export interface CartItem {
  id: string;
  title: string;
  fullTitle?: string;
  price: string;
  image: string;
  branch: string;
  branchId?: string;
  date: string;
  dateStr?: string;
  time: string;
  quantity?: number;
  technicianId?: string | null;
  technicianName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  note?: string;
}

const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      try {
        setSelf(JSON.parse(savedValue));
      } catch (e) {
        console.error("Error parsing localStorage key", key);
      }
    }
    onSet((newValue, _, isReset) => {
      if (isReset) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };

export const cartState = atom<CartItem[]>({    
  key: "cartState",
  default: [],
  effects_UNSTABLE: [localStorageEffect<CartItem[]>("dht_mini_cart")],
});

export const checkoutState = atom<{ items: CartItem[] }>({
  key: "checkoutState",
  default: { items: []  },
});

export interface DatlichFormState {
  selectedServices: string[];
  selectedKTVs: string[];
  guestCount: number;
  selectedDate: string;
  selectedTime: string | undefined;
}

export const datlichFormState = atom<DatlichFormState>({
  key: "datlichFormState",
  default: {
    selectedServices: [],
    selectedKTVs: [],
    guestCount: 1,
    selectedDate: "",
    selectedTime: "09:00",
  }
});

export interface BookingHistoryItem {
  id: string;
  serviceId?: string;
  title: string;
  fullTitle?: string;
  price: string;
  date: string;
  status: "Chờ xác nhận" | "Đã xác nhận" | "Đang phục vụ" | "Đã hoàn thành" | "Đã hủy";
  rawStatus?: string;
  scheduledStart?: string;
  dateStr?: string;
  time?: string;
  quantity?: number;
  branchId?: string;
  branch: string;
  branchAddress?: string;
  image: string;
  customerName?: string;
  customerPhone?: string;
  technicianId?: string | null;
  technicianName?: string;
  note?: string | null;
  rating?: number | null;
  review?: string | null;
  createdAt?: string;
}

export const bookingHistoryState = atom<BookingHistoryItem[]>({
  key: "bookingHistoryState",
  default: [],
  
});

export interface QuickBookingState {
  isOpen: boolean;
  item: {
    id: string;
    title: string;
    price: string;
    image: string;
    originalPrice?: string;
  } | null;
  actionType: "cart" | "buy" | "both";
  initialDateStr?: string;
  initialTime?: string;
  initialTechnicianId?: string | null;
  initialBranch?: {
    id: string;
    name: string;
  } | null;
}

export const quickBookingState = atom<QuickBookingState>({
  key: "quickBookingState",
  default: {
    isOpen: false,
    item: null,
    actionType: "cart",
  },
});
