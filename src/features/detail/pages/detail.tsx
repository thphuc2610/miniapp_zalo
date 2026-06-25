import { SpaService } from "features/danhmuc/types/service";
import { SpaMembership } from "features/nguoidung/types/membership";
import { SpaPromo } from "features/khuyenmai/types/promo";
import { quickBookingState } from "features/datlich/state/booking.state";
import React, { FC, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Page, Header } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import { openChat } from "zmp-sdk";
import MY_CONFIG from "../../../../mock/myapp_config.json";
import { getSpaServiceById, getSpaMembershipById, getSpaPromoById, getSpaArticleById } from "service/spaData";

import { useAuthCheck } from "hooks/useAuthCheck";

import { ServiceDetail } from "../components/ServiceDetail";
import { MembershipDetail } from "../components/MembershipDetail";
import { PromoDetail } from "../components/PromoDetail";
import { ArticleDetail } from "../components/ArticleDetail";

export const DetailPage: FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const { checkAuth } = useAuthCheck();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<SpaService | null>(null);
  const [membership, setMembership] = useState<SpaMembership | null>(null);
  const [promo, setPromo] = useState<SpaPromo | null>(null);
  const [article, setArticle] = useState<any | null>(null);
  const [isPastHero, setIsPastHero] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    if (!type || !id) return;

    setLoading(true);
    setIsPastHero(false);
    setShowHeader(true);
    lastScrollTopRef.current = 0;
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
          <div style={{ color: "#be185d", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>{"\u0110ang t\u1ea3i chi ti\u1ebft..."}</div>
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
              reason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 th\u00eam d\u1ecbch v\u1ee5 v\u00e0o gi\u1ecf h\u00e0ng.",
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
              reason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 \u0111\u1eb7t l\u1ecbch d\u1ecbch v\u1ee5.",
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
            message: `Xin ch\u00e0o, t\u00f4i c\u1ea7n t\u01b0 v\u1ea5n v\u1ec1 h\u1ea1ng th\u1ebb VIP: ${membership.title}`,
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
              reason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 th\u00eam th\u1ebb th\u00e0nh vi\u00ean v\u00e0o gi\u1ecf h\u00e0ng.",
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
              reason: "Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 \u0111\u1eb7t l\u1ecbch t\u01b0 v\u1ea5n th\u1ebb th\u00e0nh vi\u00ean.",
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
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#831843", marginBottom: 8 }}>{"Kh\u00f4ng t\u00ecm th\u1ea5y th\u00f4ng tin"}</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>{"D\u1ecbch v\u1ee5, th\u1ebb th\u00e0nh vi\u00ean ho\u1eb7c b\u00e0i vi\u1ebft kh\u00f4ng t\u1ed3n t\u1ea1i ho\u1eb7c \u0111\u00e3 b\u1ecb g\u1ee1 b\u1ecf."}</p>
          <button
            onClick={() => navigate("/")}
            style={{ background: "#be185d", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}
          >
            {"Quay l\u1ea1i trang ch\u1ee7"}
          </button>
        </div>
      </Page>
    );
  };

  const headerTitle = service?.title || membership?.title || promo?.title || article?.title || "Chi ti\u1ebft";
  const scrollTopButtonBottom = type === "service" ? 112 : 24;

  return (
    <Page
      ref={pageRef as any}
      onScroll={(event: any) => {
        const nextScrollTop = event.currentTarget.scrollTop;
        const lastScrollTop = lastScrollTopRef.current;

        setIsPastHero((prev) => {
          const next = nextScrollTop > 90;
          return prev === next ? prev : next;
        });

        if (nextScrollTop <= 8) {
          setShowHeader(true);
        } else if (nextScrollTop > lastScrollTop + 8) {
          setShowHeader(false);
        } else if (nextScrollTop < lastScrollTop - 8) {
          setShowHeader(true);
        }

        lastScrollTopRef.current = Math.max(0, nextScrollTop);
      }}
      style={{ height: "100vh", background: "var(--app-bg)", overflowY: "auto", position: "relative", paddingTop: 48 }}
    >
      <Header
        title={headerTitle}
        showBackIcon={true}
        style={{
          background: "var(--color-2)",
          color: "#111827",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          border: "none",
          transition: "transform 0.22s ease",
          transform: showHeader ? "translateY(0)" : "translateY(-110%)",
          pointerEvents: showHeader ? "auto" : "none",
          boxShadow: "0 1px 0 rgba(251, 207, 232, 0.9)",
        }}
      />

      <style>{`
        .zmp-header, .zaui-header {
          background-color: var(--color-2) !important;
          border-bottom: none !important;
        }
        .zmp-header *, .zaui-header *, .zmp-header-title, .zaui-header-title {
          color: #111827 !important;
        }
        .zmp-header-title, .zaui-header-title, [class*="header-title"] {
          opacity: 1 !important;
          visibility: visible !important;
          max-width: calc(100% - 96px) !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .zmp-header-btn, .zaui-header-btn {
          background: rgba(255, 255, 255, 0.45) !important;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      {renderContent()}

      {isPastHero && (
        <button
          type="button"
          aria-label="\u0110\u1ea9y l\u00ean \u0111\u1ea7u trang"
          onClick={() => pageRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            right: 16,
            bottom: `calc(env(safe-area-inset-bottom) + ${scrollTopButtonBottom}px)`,
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "1px solid rgba(190, 24, 93, 0.18)",
            background: "#fdf2f8",
            color: "#be185d",
            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)",
            zIndex: 30,
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
