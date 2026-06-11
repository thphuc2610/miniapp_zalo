import React, { FC, useState, useEffect } from "react";
import { Box, Header, Page, Text, Spinner } from "zmp-ui";
import { getSpaSettings } from "service/spaData";
import { buildAssetUrl } from "utils/common";
import Logo_Spa from "static/logo.png";

const GioiThieuPage: FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpaSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Page style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fdf2f8" }}>
        <Spinner />
      </Page>
    );
  }

  const logoUrl = settings?.logoUrl ? buildAssetUrl(settings.logoUrl) : Logo_Spa;
  const brandName = settings?.brandName;
  const introHtml = settings?.introHtml;

  return (
    <Page className="flex flex-col" style={{ background: "#fff", minHeight: "100vh" }}>
      <Header title="Giới thiệu" showBackIcon={true}
        style={{ fontSize: 18, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }}
      />

      <div style={{ overflowY: "auto", flex: 1, paddingBottom: 40, }}>
        <Box className="text-center" style={{ marginTop: "2em", padding: "0 14px 20px", }}>
          {/* Logo */}
          <div
            style={{
              width: 100,
              height: 100,
              margin: "0 auto 24px",
              borderRadius: 24,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(131, 24, 67, 0.12)",
              border: "1.5px solid #fce7f3",
              overflow: "hidden",
            }}
          >
            <img src={logoUrl} style={{ width: "80%", height: "80%", objectFit: "contain", }} />
          </div>

          {/* Tên thương hiệu */}
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#831843", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5, }}>
            {brandName}
          </h1>

          {/* Slogan */}
          <p style={{ fontSize: 14, fontStyle: "italic", color: "#64748b", fontWeight: 600, marginBottom: 28, }}>
            "Chăm sóc Sức khỏe & Sắc đẹp Khởi nguồn từ Tâm"
          </p>

          {/* Nội dung giới thiệu */}
          <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.9, textAlign: "justify", fontWeight: 500, padding: "0 4px", }}
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />

          {/* Thông tin liên hệ */}
          <div style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>
              <u>Thông tin liên hệ</u>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <span style={{ fontWeight: 700 }}>Địa chỉ: </span>
                <span style={{ lineHeight: 1.6 }}>{settings?.address}</span>
              </div>

              <div>
                <span style={{ fontWeight: 700 }}>Hotline: </span>
                <span style={{ lineHeight: 1.6 }}>{settings?.phone}</span>
              </div>

              <div>
                <span style={{ fontWeight: 700 }}>Giờ mở cửa: </span>
                <span style={{ lineHeight: 1.6 }}>{settings?.workingHours}</span>
              </div>
            </div>
          </div>
        </Box>
      </div>
    </Page>
  );
};

export default GioiThieuPage;
