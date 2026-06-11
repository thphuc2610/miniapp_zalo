import React, { FC, useEffect, useState } from "react";
import { Page, Header } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { getSpaArticles } from "service/spaData";
import { buildAssetUrl } from "utils/common";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NewsPage: FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpaArticles().then((data) => {
      setArticles(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Page style={{ height: "100vh", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#be185d", fontWeight: 800 }}>Đang tải tin tức...</div>
      </Page>
    );
  }

  return (
    <Page style={{ height: "100vh", background: "#fdf2f8", overflowY: "auto", paddingBottom: 80 }}>
      <Header
        title="Cẩm nang & Tin tức"
        showBackIcon={true}
        style={{ fontSize: 18, fontWeight: 700, textAlign: "center", background: "var(--color-2)" }}
      />

      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>Chưa có bài viết nào.</div>
        ) : (
          articles.map((article) => {
            const publishedAt = article.publishedAt || article.createdAt;
            const category = article.categoryName || "Tin tức";

            return (
              <div
                key={article.id}
                onClick={() => navigate(`/detail/article/${article.id}`)}
                style={{ background: "#fff", borderRadius: 16, padding: 10, display: "flex", gap: 12, boxShadow: "0 4px 12px rgba(131, 24, 67, 0.03)", border: "1px solid #fce7f3", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ position: "relative", width: 96, height: 86, flexShrink: 0 }}>
                  <img src={buildAssetUrl(article.thumbnailUrl)} alt={article.title} style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", lineHeight: 1.35, textOverflow: "ellipsis", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {article.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#db2777", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {category}
                  </div>
                  {publishedAt && (
                    <div style={{ color: "#9ca3af", fontSize: 10.5, fontWeight: 700 }}>
                      {dayjs(publishedAt).format("DD/MM/YYYY")} - {dayjs(publishedAt).fromNow()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Page>
  );
};

export default NewsPage;
