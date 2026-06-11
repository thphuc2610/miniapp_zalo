import React, { FC, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Page, Header } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import { openChat } from "zmp-sdk";
import MY_CONFIG from "../../mock/myapp_config.json";
import {
  getSpaServiceById,
  getSpaMembershipById,
  getSpaPromoById,
  getSpaArticleById,
  SpaService,
  SpaMembership,
  SpaPromo
} from "service/spaData";
import { quickBookingState } from "state";
import { useAuthCheck } from "hooks/useAuthCheck";

import { ServiceDetail } from "./detail/ServiceDetail";
import { MembershipDetail } from "./detail/MembershipDetail";
import { PromoDetail } from "./detail/PromoDetail";
import { ArticleDetail } from "./detail/ArticleDetail";

export const DetailPage: FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<SpaService | null>(null);
  const [membership, setMembership] = useState<SpaMembership | null>(null);
  const [promo, setPromo] = useState<SpaPromo | null>(null);
  const [article, setArticle] = useState<any | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!type || !id) return;

    setLoading(true);
    setIsScrolled(false);
    pageRef.current?.scrollTo({ top: 0 });

    if (type === "service") {
      getSpaServiceById(id).then((res) => {
        setService(res || null);
        setLoading(false);
      });
    } else if (type === "membership") {
      getSpaMembershipById(id).then((res) => {
        setMembership(res || null);
        setLoading(false);
      });
    } else if (type === "promo") {
      getSpaPromoById(id).then((res) => {
        setPromo(res || null);
        setLoading(false);
      });
    } else if (type === "article") {
      getSpaArticleById(id).then((res) => {
        setArticle(res || null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [type, id]);

  if (loading) {
    return (
      <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="spinner" />
          <div style={{ color: "#be185d", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>Đang tải chi tiết...</div>
        </div>
        <style>{`
          .spinner { width: 48px; height: 48px; border: 4px solid #fce7f3; border-top: 4px solid #be185d; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </Page>
    );
  }

  const renderContent = () => {
    if (type === "service" && service) {
      return (
        <ServiceDetail
          item={service}
          isCombo={false}
          onOpenBookingCart={() => {
            checkAuth(() => {
              setQuickBooking({
                isOpen: true,
                item: { id: service.id, title: service.title, price: service.price, image: service.image },
                actionType: "cart"
              });
            }, {
              icon: "cart",
              reason: "Vui lòng đăng nhập để thêm dịch vụ vào giỏ hàng.",
              redirectTo: `/detail/service/${service.id}`,
            });
          }}
          onOpenBookingBuy={() => {
            checkAuth(() => {
              setQuickBooking({
                isOpen: true,
                item: { id: service.id, title: service.title, price: service.price, image: service.image },
                actionType: "buy"
              });
            }, {
              icon: "order",
              reason: "Vui lòng đăng nhập để đặt lịch dịch vụ.",
              redirectTo: `/detail/service/${service.id}`,
            });
          }}
        />
      );
    }

    if (type === "membership" && membership) {
      const handleOpenInquiry = async () => {
        try {
          await openChat({
            type: "oa",
            id: MY_CONFIG.ID_OA,
            message: `Xin chào, tôi cần tư vấn về hạng thẻ VIP: ${membership.title}`,
          });
        } catch {
          if (typeof window !== "undefined") {
            window.open(`https://zalo.me/${MY_CONFIG.ID_OA}`, "_blank", "noopener,noreferrer");
          }
        }
      };

      return (
        <MembershipDetail
          item={membership}
          onOpenInquiry={handleOpenInquiry}
          onOpenBookingCart={() => {
            checkAuth(() => {
              setQuickBooking({
                isOpen: true,
                item: { id: membership.id, title: membership.title, price: membership.price, image: "" },
                actionType: "cart"
              });
            }, {
              icon: "cart",
              reason: "Vui lòng đăng nhập để thêm thẻ thành viên vào giỏ hàng.",
              redirectTo: `/detail/membership/${membership.id}`,
            });
          }}
          onOpenBookingBuy={() => {
            checkAuth(() => {
              setQuickBooking({
                isOpen: true,
                item: { id: membership.id, title: membership.title, price: membership.price, image: "" },
                actionType: "buy"
              });
            }, {
              icon: "order",
              reason: "Vui lòng đăng nhập để đặt lịch tư vấn thẻ thành viên.",
              redirectTo: `/detail/membership/${membership.id}`,
            });
          }}
        />
      );
    }

    if (type === "promo" && promo) {
      return <PromoDetail item={promo} />;
    }

    if (type === "article" && article) {
      return <ArticleDetail item={article} />;
    }

    return (
      <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "#be185d" }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#831843", marginBottom: 8 }}>Không tìm thấy thông tin</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>Dịch vụ, thẻ thành viên hoặc bài viết không tồn tại hoặc đã bị gỡ bỏ.</p>
          <button
            onClick={() => navigate("/")}
            style={{ background: "#be185d", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}
          >
            Quay lại trang chủ
          </button>
        </div>
      </Page>
    );
  };

  const isTransparentHeader = type === "service" || type === "article";
  const showSolidHeader = !isTransparentHeader || isScrolled;
  const headerTitle = service?.title || membership?.title || article?.title || "Chi tiết";
  const scrollTopButtonBottom = type === "service" ? 112 : 24;

  return (
    <Page
      ref={pageRef as any}
      onScroll={(event: any) => {
        const nextScrolled = event.currentTarget.scrollTop > 90;
        setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
      }}
      style={{ height: "100vh", background: "var(--app-bg)", overflowY: "auto", position: "relative" }}
    >
      <Header
        title={showSolidHeader ? headerTitle : ""}
        showBackIcon={true}
        style={isTransparentHeader ? {
          background: showSolidHeader ? "var(--color-2)" : "transparent",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          border: "none",
          transition: "background 0.2s ease, box-shadow 0.2s ease",
          boxShadow: showSolidHeader ? "0 1px 0 rgba(251, 207, 232, 0.9)" : "none"
        } : {
          background: "var(--color-2)"
        }}
      />

      {isTransparentHeader && (
        <style>{`
          .zmp-header, .zaui-header {
            background-color: ${showSolidHeader ? "var(--color-2)" : "transparent"} !important;
            border-bottom: none !important;
          }
          .zmp-header *, .zaui-header *, .zmp-header-title, .zaui-header-title {
            color: ${showSolidHeader ? "#111827" : "#fff"} !important;
          }
          .zmp-header-title, .zaui-header-title, [class*="header-title"] {
            opacity: ${showSolidHeader ? "1" : "0"} !important;
            visibility: ${showSolidHeader ? "visible" : "hidden"} !important;
            max-width: ${showSolidHeader ? "calc(100% - 96px)" : "0"} !important;
            overflow: hidden !important;
            pointer-events: none !important;
          }
          .zmp-header-title *, .zaui-header-title *, [class*="header-title"] * {
            opacity: ${showSolidHeader ? "1" : "0"} !important;
            visibility: ${showSolidHeader ? "visible" : "hidden"} !important;
          }
          .zmp-header-btn, .zaui-header-btn {
            background: ${showSolidHeader ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.3)"} !important;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      )}

      {renderContent()}

      {isScrolled && (
        <button
          type="button"
          aria-label="Đẩy lên đầu trang"
          onClick={() => pageRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            right: 16,
            bottom: `calc(env(safe-area-inset-bottom) + ${scrollTopButtonBottom}px)`,
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "1px solid #fbcfe8",
            background: "#fff",
            color: "#be185d",
            boxShadow: "0 8px 20px rgba(190, 24, 93, 0.22)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </Page>
  );
};

export default DetailPage;
