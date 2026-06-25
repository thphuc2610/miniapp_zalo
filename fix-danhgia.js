const fs = require('fs');

let dgPath = 'src/features/danhgia/pages/danhgia.tsx';
let dg = fs.readFileSync(dgPath, 'utf8');

// Add Sheet and Icon to imports
dg = dg.replace(
  'import { Header, Page, useSnackbar } from "zmp-ui";',
  'import { Header, Page, useSnackbar, Sheet, Icon } from "zmp-ui";'
);

// Add isTargetSheetOpen state
dg = dg.replace(
  '  const [submitting, setSubmitting] = useState(false);',
  '  const [submitting, setSubmitting] = useState(false);\n  const [isTargetSheetOpen, setIsTargetSheetOpen] = useState(false);'
);

// Update reviewTargets to include icon
dg = dg.replace(
  /const reviewTargets = \[\s*\{\s*value: "service", label: "Đánh giá dịch vụ"\s*\},\s*\{\s*value: "technician", label: "Đánh giá kỹ thuật viên"\s*\},\s*\{\s*value: "general", label: "Góp ý chung"\s*\},?\s*\];/g,
  `const reviewTargets = [
  { value: "service", label: "Đánh giá dịch vụ", icon: "zi-star" },
  { value: "technician", label: "Đánh giá kỹ thuật viên", icon: "zi-user" },
  { value: "general", label: "Góp ý chung", icon: "zi-chat" },
];`
);

// Replace the <select> with a <button> to open Sheet
const selectRegex = /<div style=\{selectWrapStyle\}>\s*<select value=\{reviewTarget\} onChange=\{\(e\) => setReviewTarget\(e\.target\.value\)\} style=\{selectStyle\}>\s*<option value="">\{text\.targetPlaceholder\}<\/option>\s*\{reviewTargets\.map\(\(target\) => \(\s*<option key=\{target\.value\} value=\{target\.value\}>\{target\.label\}<\/option>\s*\)\)\}\s*<\/select>\s*<SelectChevron \/>\s*<\/div>/;

const newButton = `<button
              type="button"
              onClick={() => setIsTargetSheetOpen(true)}
              style={{
                width: "100%",
                minHeight: 46,
                borderRadius: 12,
                border: "1px solid rgba(190, 24, 93, 0.18)",
                padding: "0 12px",
                background: "linear-gradient(180deg, #fff 0%, #fdf2f8 100%)",
                boxShadow: "var(--shadow-chip)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                color: reviewTarget ? "#374151" : "#9ca3af",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <Icon icon={(reviewTargets.find((item) => item.value === reviewTarget)?.icon || "zi-list-1") as any} size={18} style={{ color: "#be185d", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {reviewTargets.find((item) => item.value === reviewTarget)?.label || text.targetPlaceholder}
                </span>
              </span>
              <Icon icon="zi-chevron-down" size={16} style={{ color: "#be185d", flexShrink: 0 }} />
            </button>`;

dg = dg.replace(selectRegex, newButton);

// Append Sheet component before </Page>
dg = dg.replace(
  /(\s*<\/div>\s*<\/Page>\s*\);\s*\};\s*export default ClientReviewsPage;\s*)/,
  `$1`
).replace(
  /(\s*<\/div>\s*)(<\/Page>)/,
  `$1  <Sheet visible={isTargetSheetOpen} onClose={() => setIsTargetSheetOpen(false)} autoHeight mask handler>
        <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 8 }}>{text.targetPlaceholder}</h3>
          {reviewTargets.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => { setReviewTarget(item.value); setIsTargetSheetOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                background: reviewTarget === item.value ? "#fdf2f8" : "#fff",
                border: reviewTarget === item.value ? "1px solid #be185d" : "1px solid #e5e7eb",
                color: reviewTarget === item.value ? "#be185d" : "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}
            >
              <Icon icon={item.icon as any} size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </Sheet>
    $2`
);

fs.writeFileSync(dgPath, dg, 'utf8');

console.log("Done fixing danhgia.tsx.");
