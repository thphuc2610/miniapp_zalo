import React, { FC, useEffect, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { trackSpaArticleView } from "service/spaData";
import { buildAssetUrl } from "utils/common";

dayjs.locale("vi");

type ArticleDetailProps = {
  item: any;
};

const stripLeadingTitle = (html: string) => (html || "").trim();

const pickFirstText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const pickFirstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const formatViews = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 0 : 1) + "tr lượt xem";
  if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 0 : 1) + "k lượt xem";
  return value + " lượt xem";
};

const articleCss = [
  ".article-rich-content { color: #374151; font-size: 15px; line-height: 1.78; text-align: justify; word-break: break-word; }",
  ".article-rich-content img { max-width: 100%; height: auto; border-radius: 16px; margin: 14px 0; box-shadow: var(--shadow-card); }",
  ".article-rich-content p { margin: 0 0 12px; }",
  ".article-rich-content h1, .article-rich-content h2, .article-rich-content h3 { color: #831843; line-height: 1.35; margin: 20px 0 10px; text-align: left; font-weight: 900; }",
  ".article-rich-content h1 { font-size: 22px; }",
  ".article-rich-content h2 { font-size: 20px; }",
  ".article-rich-content h3 { font-size: 18px; }",
  ".article-rich-content ul, .article-rich-content ol { padding-left: 20px; margin: 0 0 14px; }",
  ".article-rich-content li { margin-bottom: 7px; }",
].join("\\n");

export const ArticleDetail: FC<ArticleDetailProps> = ({ item }) => {
  const trackedRef = useRef(false);
  const title = pickFirstText(item.title, item.name, "Cẩm nang & tin tức");
  const summary = pickFirstText(item.summary, item.description, item.shortDescription, item.excerpt);
  const author = pickFirstText(item.authorName, item.author, item.createdByName, item.createdBy, item.publisherName, "Tâm Nhất Spa");
  const publishedAt = item.publishedAt || item.createdAt || item.updatedAt;
  const viewCount = pickFirstNumber(item.viewCount, item.views, item.totalViews, item.readCount, item.hitCount);
  const contentHtml = stripLeadingTitle(item.contentHtml || item.content || "Đang cập nhật nội dung...");

  useEffect(() => {
    trackedRef.current = false;
    const track = () => {
      if (trackedRef.current || !item.id) return;
      trackedRef.current = true;
      void trackSpaArticleView(String(item.id));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") track();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      track();
    };
  }, [item.id]);

  return (
    <article style={{ position: "relative", minHeight: "100%", paddingBottom: 40, background: "#fff" }}>
      <div style={{ position: "relative", width: "100%", height: 300, overflow: "hidden", background: "#f3f4f6" }}>
        <img src={buildAssetUrl(item.coverImageUrl || item.imageUrl || item.thumbnailUrl)} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.02) 55%, rgba(0,0,0,0.22) 100%)" }} />
      </div>

      <div style={{ padding: "18px 18px 34px", background: "#fff", borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -24, position: "relative", zIndex: 2 }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 23, lineHeight: 1.32, fontWeight: 820, color: "#831843", textAlign: "justify" }}>{title}</h1>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", color: "#64748b", fontSize: 12, fontWeight: 750, lineHeight: 1.4 }}>
          <span>{author}</span>
          {publishedAt ? <React.Fragment><span style={{ opacity: 0.5 }}>•</span><span>{dayjs(publishedAt).format("HH:mm DD/MM/YYYY")}</span></React.Fragment> : null}
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{formatViews(viewCount)}</span>
        </div>

        <div style={{ height: 1, background: "#e5e7eb", margin: "14px 0 16px" }} />

        {summary ? (
          <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: 15, lineHeight: 1.7, fontStyle: "italic", fontWeight: 600, textAlign: "justify" }}>
            {summary}
          </p>
        ) : null}

        <div className="article-rich-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      <style>{articleCss}</style>
    </article>
  );
};

export default ArticleDetail;
