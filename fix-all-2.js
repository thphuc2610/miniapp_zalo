const fs = require('fs');

// 1. Fix danhgia.tsx
let dgPath = 'src/features/danhgia/pages/danhgia.tsx';
let dg = fs.readFileSync(dgPath, 'utf8');

// Update reviewTargets
dg = dg.replace(
  /const reviewTargets = \[\s*\{\s*value: "service", label: "Đánh giá dịch vụ"\s*\},\s*\{\s*value: "technician", label: "Đánh giá kỹ thuật viên"\s*\},\s*\{\s*value: "general", label: "Góp ý chung"\s*\},?\s*\];/g,
  `const reviewTargets = [
  { value: "service", label: "Đánh giá dịch vụ", icon: "zi-star" },
  { value: "technician", label: "Đánh giá kỹ thuật viên", icon: "zi-user" },
  { value: "general", label: "Góp ý chung", icon: "zi-chat" },
];`
);

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

// 2. Fix danhmuc.tsx
let dmPath = 'src/features/danhmuc/pages/danhmuc.tsx';
let dm = fs.readFileSync(dmPath, 'utf8');
// Fix <Header title={<... />} /> -> <Header title="Danh mục" />
dm = dm.replace(/title=\{\s*<div style=\{\{ display: "flex"[\s\S]*?<\/div>\s*\}/, 'title="Danh mục"');
fs.writeFileSync(dmPath, dm, 'utf8');

// 3. Fix thanhtoan.tsx
let ttPath = 'src/features/thanhtoan/pages/thanhtoan.tsx';
let tt = fs.readFileSync(ttPath, 'utf8');
// Remove SpaPromo from import
tt = tt.replace('import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, SpaPromo } from "service/spaData";', 'import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds } from "shared/services/spaData";\nimport { SpaPromo } from "features/khuyenmai/types/promo";');
// Fix SpaPromo from old service/spaData
tt = tt.replace('import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, getCustomerProfile, SpaPromo } from "service/spaData";', 'import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, getCustomerProfile } from "shared/services/spaData";\nimport { SpaPromo } from "features/khuyenmai/types/promo";');

// If the above replace didn't work because of missing getCustomerProfile, do a generic replace
tt = tt.replace(/SpaPromo\s*\} from "service\/spaData";/, '} from "shared/services/spaData";\nimport { SpaPromo } from "features/khuyenmai/types/promo";');

// Fix TS errors
tt = tt.replace('toLocalDateTimeString(firstItem.dateStr, firstItem.time)', 'toLocalDateTimeString(firstItem.dateStr || "", firstItem.time || "")');
tt = tt.replace('branchId: firstItem.branchId,', 'branchId: firstItem.branchId || "",');

fs.writeFileSync(ttPath, tt, 'utf8');

console.log("Done fixing.");
