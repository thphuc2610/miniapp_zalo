import React, { FC } from "react";
import { Header, Page } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import { ModalComingSoonState } from "state";

import schoolLogo from "static/logo.png";
import Technology from "components/Technology";

type NotificationItem = {
  id: string;
  title: string;
  date: string;
  description: string;
};

const NotificationPage: FC = () => {
  const setComingSoon = useSetRecoilState(ModalComingSoonState);

  const notifications: NotificationItem[] = [
    {
      id: "1",
      title: "Ưu đãi đặc biệt hôm nay",
      date: "19-05-2026",
      description: "Tặng ngay voucher 100k cho liệu trình chăm sóc da mặt chuyên sâu.",
    },
    {
      id: "2",
      title: "Mừng Đại Lễ 30-04",
      date: "30-04-2026",
      description: "Giảm 20% cho tất cả dịch vụ massage body thảo dược.",
    },
    {
      id: "3",
      title: "Lời cảm ơn từ Tâm Nhất Beauty Spa & Healthy",
      date: "18-05-2026",
      description: "Cảm ơn bạn đã luôn tin tưởng và đồng hành cùng spa.",
    }
  ];

  return (
    <Page style={{ background: "#fdf2f8", height: "100vh", overflowX: "hidden" }}>
      <div style={{ height: "100%", paddingBottom: 120, overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }}>
        <Header
          title="Thông báo"
          showBackIcon={false}
          style={{
            fontSize: 18,
            fontWeight: 800,
            textAlign: "center",
            background: "var(--color-2)",
            boxShadow: "0 4px 6px rgba(131, 24, 67, 0.04)",
          }}
        />

        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            {notifications.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  background: "#fff",
                  borderRadius: 20,
                  padding: 14,
                  border: "1px solid rgba(190, 24, 93, 0.18)",
                  boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)",
                }}
              >
                <img
                  src={schoolLogo}
                  alt="Spa Logo"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "1px solid rgba(190, 24, 93, 0.18)", boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#1f2937",
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    Ngày {item.date}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#4b5563",
                      marginTop: 8,
                      lineHeight: 1.4,
                      textAlign: "justify",
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button
          onClick={() => setComingSoon(true)}
          style={{
            position: "fixed",
            right: 18,
            bottom: 84,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(190, 24, 93, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 400,
              lineHeight: "32px",
              transform: "translateY(-1px)",
            }}
          >
            +
          </span>
        </button>

      </div>
    </Page>
  );
};

export default NotificationPage;
