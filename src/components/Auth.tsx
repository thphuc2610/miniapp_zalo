import React, { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loginPromptState, refreshTokenState, selectedUserLoginToken } from "state";
import { clearStoredSession, isAccessTokenUsable, refreshStoredSession } from "utils/authSession";
import NoAuth from "pages/noauth";

type LoginPromptOptions = {
  icon?: "order" | "cart" | "profile" | "address" | "payment" | "default";
  title?: string;
  reason?: string;
  redirectTo?: string;
};

type AuthProps = {
  children: ReactNode;
  prompt?: LoginPromptOptions;
};

const defaultPrompt = {
  icon: "profile" as const,
  title: "Yêu cầu đăng nhập",
  reason: "Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.",
};

const expiredSessionReason =
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";

export const useAuthPrompt = () => {
  const location = useLocation();
  const setLoginPrompt = useSetRecoilState(loginPromptState);

  return useCallback(
    (options?: LoginPromptOptions) => {
      setLoginPrompt({
        visible: true,
        icon: options?.icon || defaultPrompt.icon,
        title: options?.title || defaultPrompt.title,
        reason: options?.reason || defaultPrompt.reason,
        redirectTo: options?.redirectTo || `${location.pathname}${location.search}`,
      });
    },
    [location.pathname, location.search, setLoginPrompt]
  );
};

export const Auth: FC<AuthProps> = ({ children }) => {
  const token = useRecoilValue(selectedUserLoginToken);
  const refreshToken = useRecoilValue(refreshTokenState);
  const setToken = useSetRecoilState(selectedUserLoginToken);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const isAuthenticated = isAccessTokenUsable(token);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;

    if (!refreshToken) {
      clearStoredSession();
      setToken(null);
      setRefreshToken(null);
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      setIsRestoringSession(true);

      try {
        const session = await refreshStoredSession(refreshToken);
        if (cancelled) return;

        if (session) {
          setToken(session.accessToken);
          setRefreshToken(session.refreshToken);
          setIsRestoringSession(false);
          return;
        }

        clearStoredSession();
        setToken(null);
        setRefreshToken(null);
      } catch {
        if (cancelled) return;

        clearStoredSession();
        setToken(null);
        setRefreshToken(null);
      }

      if (!cancelled) setIsRestoringSession(false);
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshToken, setRefreshToken, setToken]);

  if (isRestoringSession) return null;
  if (!isAuthenticated) {
    return (
      <>
        <NoAuth />
      </>
    );
  }

  return <>{children}</>;
};

export default Auth;
