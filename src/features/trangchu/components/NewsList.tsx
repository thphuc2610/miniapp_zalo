import React, { FC, useEffect, useState } from "react";
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 4, height: 20, borderRadius: 999, background: "#be185d", display: "inline-block" }} /><div style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>{"C\u1ea9m nang & tin t\u1ee9c"}</div></div>
        <div
          onClick={() => navigate("/tintuc")}
          style={{ fontSize: 12, fontWeight: 700, color: "#be185d", background: "#fdf2f8", padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(190, 24, 93, 0.32)", boxShadow: "0 6px 14px rgba(190, 24, 93, 0.12)", cursor: "pointer" }}
        >{"T\u1ea5t c\u1ea3"}</div>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {articles.map((item) => {
          const id = item.id;
          const title = item.title;
          const thumb = item.thumbnailUrl;
          const category = item.categoryName || "Tin t\u1ee9c";
          const publishedAt = item.publishedAt || item.createdAt;

          return (
            <div
              key={id}
              onClick={() => navigate(`/detail/article/${id}`)}
              style={{ width: 220, flexShrink: 0, background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", cursor: "pointer" }}
            >
              <img src={buildAssetUrl(thumb)} alt={title} style={{ width: "100%", aspectRatio: "1.6/1", objectFit: "cover", background: "#f3f4f6" }} />
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.35, minHeight: 52, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", textAlign: "justify" }}>
                  {title}
                </div>

                {publishedAt && (
                  <span style={{ color: "#9ca3af", fontSize: 10.5, fontWeight: 700 }}>
                    <span>{dayjs(publishedAt).format("DD/MM/YYYY")} - {dayjs(publishedAt).fromNow().replace(/một/g, '1')}</span>
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
