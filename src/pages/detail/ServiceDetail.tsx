import React, { FC } from "react";
import { SpaService } from "service/spaData";

interface ServiceDetailProps {
  item: SpaService;
  isCombo: boolean;
  onOpenBookingCart: () => void;
  onOpenBookingBuy: () => void;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const hasHtmlTag = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const textToRichHtml = (value?: string, fallback = "") => {
  const source = (value || fallback).trim();
  if (!source) return "";
  if (hasHtmlTag(source)) return source;

  const blocks: string[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (!bulletItems.length) return;
    blocks.push(`<ul>${bulletItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
    bulletItems = [];
  };

  source.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      return;
    }

    const bulletMatch = line.match(/^[-*•]\s*(.+)$/);
    if (bulletMatch) {
      bulletItems.push(escapeHtml(bulletMatch[1]));
      return;
    }

    flushBullets();
    blocks.push(`<p>${escapeHtml(line)}</p>`);
  });

  flushBullets();
  return blocks.join("");
};

export const ServiceDetail: FC<ServiceDetailProps> = ({ item, onOpenBookingCart, onOpenBookingBuy }) => {
  const descriptionHtml = textToRichHtml(item.description, "Đang cập nhật mô tả...");
  const contentHtml = textToRichHtml(item.contentHtml);

  return (
    <div style={{ position: "relative", minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ position: "relative", width: "100%", height: 320, overflow: "hidden" }}>
        <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)" }} />
      </div>

      <div style={{ padding: 16, background: "#fdf2f8", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, position: "relative", zIndex: 2 }}>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", margin: 0 }}>Mô tả liệu trình</h3>

            <div style={{ display: "flex", gap: 8 }}>
              {item.duration && (
                <div style={{ background: "#fff", border: "1px solid #fbcfe8", borderRadius: 30, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 800, color: "#be185d" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{item.duration}</span>
                </div>
              )}
            </div>
          </div>

          <div
            className="rich-content short-description"
            style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, fontWeight: 700 }}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />

          {contentHtml && (
            <div
              className="rich-content"
              style={{ marginTop: 14, fontSize: 14, color: "#4b5563", lineHeight: 1.65 }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>

        {item.benefits && item.benefits.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", marginBottom: 12 }}>Hiệu quả mang lại</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {item.benefits.map((benefit, index) => (
                <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ background: "#fce7f3", color: "#be185d", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.45, fontWeight: 600 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.steps && item.steps.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", marginBottom: 16 }}>Quy trình thực hiện</h3>
            <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: 12 }}>
              <div style={{ position: "absolute", top: 8, bottom: 8, left: 24, width: 2, background: "linear-gradient(to bottom, #fce7f3, #be185d 50%, #fce7f3)" }} />

              {item.steps.map((step) => (
                <div key={step.step} style={{ display: "flex", gap: 16, marginBottom: 20, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#be185d", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px #fff, 0 2px 8px rgba(190, 24, 93, 0.25)", flexShrink: 0 }}>
                    {step.step}
                  </div>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 12, border: "1px solid #fdf2f8", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", marginBottom: 4 }}>{step.title}</h4>
                    <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.4 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          padding: "14px 16px calc(env(safe-area-inset-bottom) + 20px)",
          borderTop: "1px solid #fce7f3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "#be185d" }}>Giá: {item.price}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onOpenBookingCart}
            style={{ background: "#fdf2f8", color: "#be185d", border: "1px solid #fbcfe8", padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800 }}
          >
            Thêm giỏ hàng
          </button>
          <button
            onClick={onOpenBookingBuy}
            style={{ background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", color: "#fff", border: "none", padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800 }}
          >
            Đặt lịch
          </button>
        </div>
      </div>
      <style>{`
        .rich-content { text-align: justify; word-break: break-word; }
        .rich-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 10px 0; }
        .rich-content p { margin: 0 0 8px; }
        .rich-content ul, .rich-content ol { padding-left: 20px; margin: 0 0 10px; }
        .rich-content li { margin-bottom: 6px; }
        .short-description p, .short-description li { font-weight: 700; }
      `}</style>
    </div>
  );
};
