import React, { FC } from "react";
import { SpaService } from "features/danhmuc/types/service";

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

const decodeHtmlEntities = (value: string) => {
  let decoded = value;
  for (let i = 0; i < 6; i += 1) {
    const next = decoded
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#60;|&#x3c;/gi, "<")
      .replace(/&#62;|&#x3e;/gi, ">")
      .replace(/&quot;|&#34;|&#x22;/gi, '\"')
      .replace(/&#039;|&#39;|&#x27;|&apos;/gi, "'")
      .replace(/&nbsp;|&#160;|&#xa0;/gi, " ");
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
};

const stripEmptyHeadings = (value: string) =>
  value.replace(/<h[1-6][^>]*>\s*(<br\s*\/?>\s*)*<\/h[1-6]>/gi, "");

const renderHtmlListsWithVisibleMarkers = (html: string) => {
  const renderList = (type: "ul" | "ol", body: string) => {
    let index = 0;
    const items = body.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, content) => {
      index += 1;
      const marker = type === "ol" ? String(index) + "." : "•";
      return '<div class="service-rich-list-item" style="display:flex;align-items:flex-start;gap:8px;margin:0 0 7px;text-align:justify;"><span class="service-rich-list-marker" style="display:inline-block;min-width:12px;width:12px;flex:0 0 12px;color:#be185d;font-weight:900;line-height:1.72;text-align:center;">' + marker + '</span><span class="service-rich-list-content" style="display:block;min-width:0;flex:1;">' + content + '</span></div>';
    });

    return '<div class="service-rich-list service-rich-list--' + type + '" style="display:block;margin:0 0 12px;">' + items + '</div>';
  };

  return html
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, body) => renderList("ul", body))
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, body) => renderList("ol", body));
};

const textToRichHtml = (value?: string, fallback = "") => {
  const source = decodeHtmlEntities(value || fallback).trim();
  if (!source) return "";
  if (hasHtmlTag(source)) return renderHtmlListsWithVisibleMarkers(stripEmptyHeadings(source));

  const blocks: string[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (!bulletItems.length) return;
    blocks.push("<ul>" + bulletItems.map((item) => "<li>" + item + "</li>").join("") + "</ul>");
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
    blocks.push("<p>" + escapeHtml(line) + "</p>");
  });

  flushBullets();
  return blocks.join("");
};

const richContentCss = [
  ".service-rich-content { color: #374151; font-size: 14.5px; line-height: 1.72; text-align: justify; word-break: break-word; }",
  ".service-rich-content p { margin: 0 0 10px; }",
  ".service-rich-content ul, .service-rich-content ol { list-style: none !important; padding-left: 0; margin: 0 0 12px; }",
  ".service-rich-content li { display: block; margin-bottom: 7px; }",
  ".service-rich-list { display: grid; gap: 7px; margin: 0 0 12px; }",
  ".service-rich-list-item { display: flex; align-items: flex-start; gap: 8px; text-align: justify; }",
  ".service-rich-list-marker { display: inline-block; min-width: 12px; width: 12px; flex: 0 0 12px; color: #be185d; font-weight: 900; line-height: 1.72; text-align: center; }",
  ".service-rich-list-content { display: block; min-width: 0; flex: 1; }",
  ".service-rich-list-content em { font-style: italic; }",
  ".service-rich-content img { max-width: 100%; height: auto; border-radius: 14px; margin: 12px 0; box-shadow: var(--shadow-card); }",
  ".service-rich-content h1, .service-rich-content h2, .service-rich-content h3 { color: #831843; line-height: 1.35; margin: 18px 0 10px; font-weight: 900; }",
  ".service-description h1, .service-description h2, .service-description h3 { margin: 0 0 3px; font-size: 15px; color: #831843; font-weight: 900; }",
  ".service-description p, .service-description li, .service-description .service-rich-list-content { font-weight: 700; }",
].join("\\n");

export const ServiceDetail: FC<ServiceDetailProps> = ({ item, onOpenBookingCart, onOpenBookingBuy }) => {
  const descriptionHtml = textToRichHtml(item.description, "Đang cập nhật điểm nổi bật...");
  const contentHtml = textToRichHtml(item.contentHtml);
  const durationLabel = item.duration ? String(item.duration).replace(/\s*(phút|phut|minutes?|mins?)\s*$/i, " phút") : "";

  return (
    <div style={{ position: "relative", minHeight: "100%", paddingBottom: 118, background: "#fff" }}>
      <div style={{ position: "relative", width: "100%", height: 300, overflow: "hidden", background: "#f3f4f6" }}>
        <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.02) 56%, rgba(0,0,0,0.18) 100%)" }} />
      </div>

      <div style={{ padding: "18px 18px 34px", background: "#fff", borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -24, position: "relative", zIndex: 2 }}>
        <h1 style={{ margin: "0 0 14px", fontSize: 23, lineHeight: 1.36, fontWeight: 850, color: "#831843", textAlign: "justify" }}>{item.title}</h1>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
          <span style={{ color: "#be185d", fontSize: 17, fontWeight: 900, whiteSpace: "nowrap" }}>Giá: {item.price}</span>
          {durationLabel ? (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 5, color: "#be185d", fontSize: 13.5, fontWeight: 850, whiteSpace: "nowrap", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{durationLabel}</span>
            </span>
          ) : null}
        </div>

        <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 16px" }} />
        
        <div className="service-rich-content service-description" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        {contentHtml ? <div className="service-rich-content" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: contentHtml }} /> : null}

        {item.benefits && item.benefits.length > 0 ? (
          <>
            <h3 style={{ margin: "18px 0 10px", color: "#831843", fontSize: 16, fontWeight: 850 }}>Hiệu quả mang lại</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {item.benefits.map((benefit, index) => (
                <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: "#fdf2f8", color: "#be185d", fontWeight: 900, flexShrink: 0 }}>{index + 1}</div>
                  <span style={{ color: "#374151", fontSize: 13.5, lineHeight: 1.5, fontWeight: 650 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {item.steps && item.steps.length > 0 ? (
          <>
            <h3 style={{ margin: "18px 0 10px", color: "#831843", fontSize: 16, fontWeight: 850 }}>Quy trình thực hiện</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {item.steps.map((step) => (
                <div key={step.step} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, alignItems: "start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#be185d", color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, boxShadow: "0 0 0 5px #fdf2f8" }}>{step.step}</div>
                  <div style={{ paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ color: "#111827", fontSize: 14, fontWeight: 850 }}>{step.title}</div>
                    <div style={{ color: "#64748b", fontSize: 12.5, lineHeight: 1.45, fontWeight: 650, marginTop: 4 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(16px)", padding: "12px 16px calc(env(safe-area-inset-bottom) + 16px)", borderTop: "1px solid #fce7f3", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, zIndex: 20 }}>
        <button onClick={onOpenBookingCart} style={{ minHeight: 46, background: "#fdf2f8", color: "#be185d", border: "1px solid rgba(190, 24, 93, 0.18)", borderRadius: 14, fontSize: 13.5, fontWeight: 850, boxShadow: "var(--shadow-chip)" }}>Thêm giỏ hàng</button>
        <button onClick={onOpenBookingBuy} style={{ minHeight: 46, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 13.5, fontWeight: 900, boxShadow: "var(--shadow-button)" }}>Đặt lịch</button>
      </div>

      <style>{richContentCss}</style>
    </div>
  );
};
