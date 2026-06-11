import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { getSpaArticles } from "service/spaData";
import { buildAssetUrl } from "utils/common";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NewsList: FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    getSpaArticles().then((data) => {
      if (data && data.length > 0) {
        setArticles(data.slice(0, 5));
      }
    });
  }, []);

  if (articles.length === 0) return null;

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>Cẩm nang & tin tức</div>
        <div
          onClick={() => navigate("/tintuc")}
          style={{ fontSize: 12, fontWeight: 600, color: "#be185d", background: "#fdf2f8", padding: "4px 12px", borderRadius: 999, cursor: "pointer" }}
        >
          Tất cả
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {articles.map((item) => {
          const id = item.id;
          const title = item.title;
          const thumb = item.thumbnailUrl;
          const category = item.categoryName || "Tin tức";
          const publishedAt = item.publishedAt || item.createdAt;

          return (
            <div
              key={id}
              onClick={() => navigate(`/detail/article/${id}`)}
              style={{ width: 220, flexShrink: 0, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #fbcfe8", display: "flex", flexDirection: "column", cursor: "pointer" }}
            >
              <img src={buildAssetUrl(thumb)} alt={title} style={{ width: "100%", aspectRatio: "1.6/1", objectFit: "cover", background: "#f3f4f6" }} />
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.35, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {title}
                </div>
                <span style={{ fontSize: 10, color: "#db2777", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {category}
                </span>
                {publishedAt && (
                  <span style={{ color: "#9ca3af", fontSize: 10.5, fontWeight: 700 }}>
                    {dayjs(publishedAt).format("DD/MM/YYYY")} - {dayjs(publishedAt).fromNow()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsList;
