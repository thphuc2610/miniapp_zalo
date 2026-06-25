const fs = require('fs');

let path = 'src/features/danhgia/pages/danhgia.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change the button to a div and add pointer-events none to children
const targetButton = `<button
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

const replacementDiv = `<div
              role="button"
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
                cursor: "pointer"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, pointerEvents: "none" }}>
                <Icon icon={(reviewTargets.find((item) => item.value === reviewTarget)?.icon || "zi-list-1") as any} size={18} style={{ color: "#be185d", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {reviewTargets.find((item) => item.value === reviewTarget)?.label || text.targetPlaceholder}
                </span>
              </span>
              <div style={{ pointerEvents: "none" }}><Icon icon="zi-chevron-down" size={16} style={{ color: "#be185d", flexShrink: 0 }} /></div>
            </div>`;

content = content.replace(targetButton.replace(/\r/g, ''), replacementDiv.replace(/\r/g, ''));

// 2. Change the native select elements
const targetSelects = `{reviewTarget === "service" && (
              <div style={selectWrapStyle}>
                <select value={selectedServiceName} onChange={(e) => setSelectedServiceName(e.target.value)} style={selectStyle}>
                  <option value="">{text.servicePlaceholder}</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>{service.title}</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            )}
            {reviewTarget === "technician" && (
              <div style={selectWrapStyle}>
                <select value={selectedTechnicianName} onChange={(e) => setSelectedTechnicianName(e.target.value)} style={selectStyle}>
                  <option value="">{text.technicianPlaceholder}</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.fullName}>{technician.fullName}</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            )}`;

const replacementSelects = `{reviewTarget === "service" && (
              <div style={selectWrapStyle} onClick={() => setIsServiceSheetOpen(true)} role="button">
                <div style={{ ...selectStyle, display: "flex", alignItems: "center", color: selectedServiceName ? "#374151" : "#9ca3af", cursor: "pointer" }}>
                   <span style={{ pointerEvents: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedServiceName || text.servicePlaceholder}</span>
                </div>
                <SelectChevron />
              </div>
            )}
            {reviewTarget === "technician" && (
              <div style={selectWrapStyle} onClick={() => setIsTechnicianSheetOpen(true)} role="button">
                <div style={{ ...selectStyle, display: "flex", alignItems: "center", color: selectedTechnicianName ? "#374151" : "#9ca3af", cursor: "pointer" }}>
                  <span style={{ pointerEvents: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedTechnicianName || text.technicianPlaceholder}</span>
                </div>
                <SelectChevron />
              </div>
            )}`;

content = content.replace(targetSelects.replace(/\r/g, ''), replacementSelects.replace(/\r/g, ''));

// 3. Add states and sheets for Service and Technician
const targetStates = `  const [submitting, setSubmitting] = useState(false);
  const [isTargetSheetOpen, setIsTargetSheetOpen] = useState(false);`;

const replacementStates = `  const [submitting, setSubmitting] = useState(false);
  const [isTargetSheetOpen, setIsTargetSheetOpen] = useState(false);
  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [isTechnicianSheetOpen, setIsTechnicianSheetOpen] = useState(false);`;

content = content.replace(targetStates.replace(/\r/g, ''), replacementStates.replace(/\r/g, ''));

// 4. Add the sheets to the end
const targetEndSheet = `</Sheet>
    </Page>`;

const replacementEndSheet = `</Sheet>
      <Sheet visible={isServiceSheetOpen} onClose={() => setIsServiceSheetOpen(false)} autoHeight mask handler>
        <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 8 }}>{text.servicePlaceholder}</h3>
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => { setSelectedServiceName(service.title); setIsServiceSheetOpen(false); }}
              style={{
                display: "flex", alignItems: "center", padding: "14px 16px", borderRadius: 12,
                background: selectedServiceName === service.title ? "#fdf2f8" : "#fff",
                border: selectedServiceName === service.title ? "1px solid #be185d" : "1px solid #e5e7eb",
                color: selectedServiceName === service.title ? "#be185d" : "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}
            >
              {service.title}
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet visible={isTechnicianSheetOpen} onClose={() => setIsTechnicianSheetOpen(false)} autoHeight mask handler>
        <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 8 }}>{text.technicianPlaceholder}</h3>
          {technicians.map((technician) => (
            <button
              key={technician.id}
              type="button"
              onClick={() => { setSelectedTechnicianName(technician.fullName); setIsTechnicianSheetOpen(false); }}
              style={{
                display: "flex", alignItems: "center", padding: "14px 16px", borderRadius: 12,
                background: selectedTechnicianName === technician.fullName ? "#fdf2f8" : "#fff",
                border: selectedTechnicianName === technician.fullName ? "1px solid #be185d" : "1px solid #e5e7eb",
                color: selectedTechnicianName === technician.fullName ? "#be185d" : "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}
            >
              {technician.fullName}
            </button>
          ))}
        </div>
      </Sheet>
    </Page>`;

content = content.replace(targetEndSheet.replace(/\r/g, ''), replacementEndSheet.replace(/\r/g, ''));

fs.writeFileSync(path, content, 'utf8');
console.log("Patched danhgia.tsx successfully");
