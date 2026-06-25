import { atom, AtomEffect } from "recoil";

export interface AddressItem {
  id: string;
  name: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
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

export const savedAddressesState = atom<AddressItem[]>({
  key: "savedAddressesStatePersistence",
  default: [],
  effects_UNSTABLE: [localStorageEffect<AddressItem[]>("dht_mini_addresses")],
});
