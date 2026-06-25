import { SpaBranch } from "types/common";
import { atom, AtomEffect } from "recoil";

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
      if (isReset || newValue === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };

export const ATOM_XIN_QUYEN = atom<boolean>({
  key: "ATOM_XIN_QUYEN",
  default: false,
});

export const ATOM_HAS_AUTO_LOGIN = atom<boolean>({
  key: "ATOM_HAS_AUTO_LOGIN",
  default: false,
});

export const ATOM_DA_XIN_QUYEN = atom<boolean>({     
  key: "ATOM_DA_XIN_QUYEN",
  default: false,
});

export type LoginPromptIcon =
  | "order"
  | "cart"
  | "profile"
  | "address"
  | "payment"
  | "default";

export type LoginPromptState = {
  visible: boolean;
  icon: LoginPromptIcon;
  title: string;
  reason: string;
  redirectTo: string;
};

export const loginPromptState = atom<LoginPromptState>({
  key: "loginPromptState",
  default: {
    visible: false,
    icon: "default",
    title: "Yêu cầu đăng nhập",
    reason: "Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.",
    redirectTo: "",
  },
});

export const ATOM_DA_THEO_DOI = atom<boolean>({      
  key: "ATOM_DA_THEO_DOI",
  default: false,
});

export const ATOM_THEO_DOI = atom<boolean>({
  key: "ATOM_THEO_DOI",
  default: false,
});

export const ATOM_CHUA_THEO_DOI = atom<boolean>({    
  key: "ATOM_CHUA_THEO_DOI",
  default: false,
});

export const ATOM_LOADING_USER = atom<boolean>({     
  key: "ATOM_LOADING_USER",
  default: true,
});

export const ATOM_APP_ID = atom<string | null>({     
  key: "atomAPP_ID",
  default: null,
});

export const selectedBranchState = atom<SpaBranch | null>({
  key: "selectedBranchState",
  default: null,
  effects_UNSTABLE: [localStorageEffect<SpaBranch | null>("tamnhat_spa_selected_branch")],
});

export const selectedIsLoadingState = atom({
  key: "selectedIsLoading",
  default: false,
});

export const ModalComingSoonState = atom<boolean>({
  key: "ModalComingSoonState",
  default: false,
});

export const ContactSupportModalState = atom<boolean>({
  key: "ContactSupportModalState",
  default: false,
});
