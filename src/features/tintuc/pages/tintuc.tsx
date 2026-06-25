import React, { FC, useEffect, useState } from "react";
import { Page, Header } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";
import { getSpaArticles } from "service/spaData";
import { buildAssetUrl } from "utils/common";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("vi", {
  relativeTime: {
    future: "trong %s",
    past: "%s trước",
    s: "vài giây",
    m: "1 phút",
    mm: "%d phút",
    h: "1 giờ",
    hh: "%d giờ",
    d: "1 ngày",
    dd: "%d ngày",
    M: "1 tháng",
    MM: "%d tháng",
    y: "1 năm",
    yy: "%d năm"
  }
});
dayjs.locale("vi");

const formatViews = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 0 : 1) + "tr lượt xem";
  if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 0 : 1) + "k lượt xem";
  return value + " lượt xem";
};

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
                style={{ background: "#fff", borderRadius: 14, padding: "8px 10px", display: "flex", gap: 10, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ position: "relative", width: 88, height: 74, flexShrink: 0 }}>
                  <img src={buildAssetUrl(article.thumbnailUrl)} alt={article.title} style={{ width: "100%", height: "100%", borderRadius: 10, objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", lineHeight: 1.35, textOverflow: "ellipsis", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", textAlign: "justify" }}>
                    {article.title}
                  </div>

                  {publishedAt && (
                    <div style={{ color: "#9ca3af", fontSize: 10.5, fontWeight: 700 }}>
                      <span>{dayjs(publishedAt).format("DD/MM/YYYY")} - {dayjs(publishedAt).fromNow().replace(/một/g, '1')}</span>
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
