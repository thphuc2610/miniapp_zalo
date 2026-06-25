import React, { FC } from "react";
import { useSetRecoilState } from "recoil";
import { Sheet } from "zmp-ui";
import { ATOM_DA_XIN_QUYEN, ATOM_XIN_QUYEN } from "state";

export const ICONS = {
  order: "calendar",
  cart: "cart",
  profile: "profile",
  address: "pin",
  payment: "card",
  default: "lock",
} as const;

type LoginPromptIcon = keyof typeof ICONS;

interface LoginPromptModalProps {
  visible: boolean;
  icon?: LoginPromptIcon;
  title?: string;
  reason?: string;
  onClose: () => void;
}

const iconPaths: Record<(typeof ICONS)[LoginPromptIcon], React.ReactNode> = {
  calendar: (
    <>
      <path d="M7 3v3M17 3v3M4 9h16" />
      <rect x="4" y="5" width="16" height="17" rx="3" />
      <path d="M8 13h3M8 17h6" />
    </>
  ),
  cart: (
    <>
      <path d="M4 5h2l2.2 10.4a2 2 0 0 0 2 1.6h6.9a2 2 0 0 0 1.9-1.4L21 8H7" />
      <circle cx="10" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c1.5-4 4.2-6 7.5-6s6 2 7.5 6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s7-6.5 7-13A7 7 0 0 0 5 9c0 6.5 7 13 7 13Z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18M7 15h3M14 15h3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="3" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
};

export const LoginPromptModal: FC<LoginPromptModalProps> = ({
  visible,
  icon = "default",
  title = "Yêu cầu đăng nhập",
  reason = "Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.",
  onClose,
}) => {
  const setOpenSheetLogin = useSetRecoilState(ATOM_XIN_QUYEN);
  const setDaXinQuyen = useSetRecoilState(ATOM_DA_XIN_QUYEN);
  const resolvedIcon = ICONS[icon] ?? ICONS.default;

  const handleLogin = () => {
    onClose();
    setDaXinQuyen(false);
    setTimeout(() => setOpenSheetLogin(true), 180);
  };

  return (
    <Sheet visible={visible} onClose={onClose} mask handler autoHeight className="login-prompt-sheet">
      <div className="login-prompt-sheet__body">
        <button className="login-prompt-sheet__close" type="button" onClick={onClose} aria-label="Đóng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="login-prompt-sheet__icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              {iconPaths[resolvedIcon]}
            </g>
          </svg>
        </div>

        <div className="login-prompt-sheet__title">{title}</div>
        <div className="login-prompt-sheet__reason">{reason}</div>

        <div className="login-prompt-sheet__actions">
          <button className="login-prompt-sheet__secondary" type="button" onClick={onClose}>
            Để sau
          </button>
          <button className="login-prompt-sheet__primary" type="button" onClick={handleLogin}>
            Xác nhận
          </button>
        </div>
      </div>
    </Sheet>
  );
};

export default LoginPromptModal;
