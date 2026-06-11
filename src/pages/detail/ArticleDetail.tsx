import React, { FC } from "react";
import { buildAssetUrl } from "utils/common";

type ArticleDetailProps = {
  item: any;
};

const stripLeadingTitle = (html: string, title?: string) => {
  if (!html || !title) return html;

  const normalizedTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingPattern = new RegExp(`^\\s*<h[1-3][^>]*>\\s*${normalizedTitle}\\s*</h[1-3]>`, "i");
  const paragraphPattern = new RegExp(`^\\s*<p[^>]*>\\s*(?:<strong>|<b>)?\\s*${normalizedTitle}\\s*(?:</strong>|</b>)?\\s*</p>`, "i");

  return html.replace(headingPattern, "").replace(paragraphPattern, "").trim();
};

export const ArticleDetail: FC<ArticleDetailProps> = ({ item }) => {
  const contentHtml = stripLeadingTitle(
    item.contentHtml || item.content || "Đang cập nhật nội dung...",
    item.title,
  );

  return (
    <div style={{ position: "relative", minHeight: "100%", paddingBottom: 40 }}>
      <div style={{ position: "relative", width: "100%", height: 320, overflow: "hidden" }}>
        <img src={buildAssetUrl(item.thumbnailUrl)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.28) 100%)" }} />
      </div>

      <div style={{ padding: 16, background: "#fdf2f8", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, position: "relative", zIndex: 2 }}>
        <div
          className="rich-content"
          style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>

      <style>{`
        .rich-content { text-align: justify; word-break: break-word; }
        .rich-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 10px 0; }
        .rich-content p { margin: 0 0 10px; }
        .rich-content ul, .rich-content ol { padding-left: 20px; margin: 0 0 12px; }
        .rich-content li { margin-bottom: 6px; }
      `}</style>
    </div>
  );
};

export default ArticleDetail;
