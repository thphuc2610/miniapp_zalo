import { useRecoilValue, useSetRecoilState } from "recoil";
import { useLocation } from "react-router-dom";
import { loginPromptState, refreshTokenState, selectedUserLoginToken } from "../state";
import { clearStoredSession, isAccessTokenUsable, refreshStoredSession } from "utils/authSession";

type AuthPromptOptions = {
  icon?: "order" | "cart" | "profile" | "address" | "payment" | "default";
  title?: string;
  reason?: string;
  redirectTo?: string;
};

export const useAuthCheck = () => {
  const token = useRecoilValue(selectedUserLoginToken);
  const refreshToken = useRecoilValue(refreshTokenState);
  const setToken = useSetRecoilState(selectedUserLoginToken);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setLoginPrompt = useSetRecoilState(loginPromptState);
  const location = useLocation();

  const showLoginPrompt = (options?: AuthPromptOptions) => {
    setLoginPrompt({
      visible: true,
      icon: options?.icon || "default",
      title: options?.title || "Yêu cầu đăng nhập",
      reason: options?.reason || "Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.",
      redirectTo: options?.redirectTo || `${location.pathname}${location.search}`,
    });
  };

  const checkAuth = (callback: () => void, options?: AuthPromptOptions) => {
    if (isAccessTokenUsable(token)) {
      callback();
      return true;
    }

    if (refreshToken) {
      refreshStoredSession(refreshToken)
        .then((session) => {
          if (!session) {
            clearStoredSession();
            setToken(null);
            setRefreshToken(null);
            showLoginPrompt(options);
            return;
          }

          setToken(session.accessToken);
          setRefreshToken(session.refreshToken);
          callback();
        })
        .catch(() => {
          clearStoredSession();
          setToken(null);
          setRefreshToken(null);
          showLoginPrompt(options);
        });
      return true;
    }

    clearStoredSession();
    setToken(null);
    setRefreshToken(null);
    showLoginPrompt(options);
    return false;
  };

  const isAuthenticated = isAccessTokenUsable(token) || Boolean(refreshToken);

  return { checkAuth, isAuthenticated };
};
