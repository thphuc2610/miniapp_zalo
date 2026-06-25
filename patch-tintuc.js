const fs = require('fs');

let path = 'src/features/tintuc/pages/tintuc.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add updateLocale import
content = content.replace(
  'import relativeTime from "dayjs/plugin/relativeTime";\nimport "dayjs/locale/vi";',
  'import relativeTime from "dayjs/plugin/relativeTime";\nimport updateLocale from "dayjs/plugin/updateLocale";\nimport "dayjs/locale/vi";'
);

// Add updateLocale config
content = content.replace(
  'dayjs.extend(relativeTime);\ndayjs.locale("vi");',
  'dayjs.extend(relativeTime);\ndayjs.extend(updateLocale);\ndayjs.updateLocale("vi", {\n  relativeTime: {\n    future: "trong %s",\n    past: "%s trước",\n    s: "vài giây",\n    m: "1 phút",\n    mm: "%d phút",\n    h: "1 giờ",\n    hh: "%d giờ",\n    d: "1 ngày",\n    dd: "%d ngày",\n    M: "1 tháng",\n    MM: "%d tháng",\n    y: "1 năm",\n    yy: "%d năm"\n  }\n});\ndayjs.locale("vi");'
);

// Add formatViews function
const formatViewsFunc = `
const formatViews = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 0 : 1) + "tr lượt xem";
  if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 0 : 1) + "k lượt xem";
  return value + " lượt xem";
};
`;

content = content.replace(
  'export const NewsPage: FC = () => {',
  formatViewsFunc + '\nexport const NewsPage: FC = () => {'
);

// Add author and views to the render
const originalRender = `                  <div style={{ fontSize: 10.5, color: "#db2777", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {category}
                  </div>
                  {publishedAt && (
                    <div style={{ color: "#9ca3af", fontSize: 10.5, fontWeight: 700 }}>
                      {dayjs(publishedAt).format("DD/MM/YYYY")} - {dayjs(publishedAt).fromNow()}
                    </div>
                  )}`;

const newRender = `                  <div style={{ fontSize: 10.5, color: "#db2777", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {category} • {article.authorName || "Tâm Nhất Spa"}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 10.5, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                    <span>{publishedAt ? dayjs(publishedAt).fromNow() : ""}</span>
                    <span>{formatViews(Number(article.viewCount || 0))}</span>
                  </div>`;

content = content.replace(originalRender, newRender);

fs.writeFileSync(path, content, 'utf8');
console.log('Done patching tintuc.tsx');
