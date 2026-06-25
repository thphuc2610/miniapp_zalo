const fs = require('fs');
let content = fs.readFileSync('src/shared/components/QuickBookingSheet.tsx', 'utf8');

// 1. Fix imports
content = content.replace(
  'import { quickBookingState, cartState, checkoutState } from "features/datlich/state/booking.state";',
  'import { quickBookingState, cartState, checkoutState, QuickBookingState } from "features/datlich/state/booking.state";'
);
content = content.replace(
  'const [state, setState] = useRecoilState(quickBookingState);',
  'const [state, setState] = useRecoilState<QuickBookingState>(quickBookingState);'
);

// 2. Change selectedKTV state to support string[]
content = content.replace(
  'const [selectedKTV, setSelectedKTV] = useState<string | undefined>(undefined);',
  'const [selectedKTV, setSelectedKTV] = useState<string | string[] | undefined>(undefined);'
);

// 3. Fix busy technician logic
content = content.replace(
  'if (selectedKTV && ids.includes(String(selectedKTV))) {',
  'const ktvBusy = selectedKTV ? (Array.isArray(selectedKTV) ? selectedKTV.some(id => ids.includes(String(id))) : ids.includes(String(selectedKTV))) : false;\n      if (ktvBusy) {'
);

content = content.replace(
  'return ids.includes(String(selectedKTV)) ? slot : null;',
  'const ktvBusy = selectedKTV ? (Array.isArray(selectedKTV) ? selectedKTV.some(id => ids.includes(String(id))) : ids.includes(String(selectedKTV))) : false;\n      return ktvBusy ? slot : null;'
);

content = content.replace(
  'const isBusy = ids.includes(String(selectedKTV));',
  'const isBusy = selectedKTV ? (Array.isArray(selectedKTV) ? selectedKTV.some(id => ids.includes(String(id))) : ids.includes(String(selectedKTV))) : false;'
);

// 4. Update newItem payload
content = content.replace(
  `    const technicianName = selectedKTV ? technicians.find(t => String(t.id) === String(selectedKTV))?.fullName || "" : "";
    const newItem = {
      id: state.item.id,
      title: state.item.title,
      price: state.item.price,
      image: state.item.image,
      branch: activeBranch.name,
      branchId: activeBranch.id,
      date: dateLabel,
      dateStr: selectedDate,
      time: selectedTime,
      quantity: quantity,
      technicianId: selectedKTV || null,
      technicianName: technicianName
    };`,
  `    const technicianName = selectedKTV 
      ? (Array.isArray(selectedKTV) 
          ? selectedKTV.map(id => technicians.find(t => String(t.id) === String(id))?.fullName || "").filter(Boolean).join(", ") 
          : technicians.find(t => String(t.id) === String(selectedKTV))?.fullName || "") 
      : "";
    const technicianIdsStr = selectedKTV 
      ? (Array.isArray(selectedKTV) ? selectedKTV.join(",") : String(selectedKTV)) 
      : null;

    const newItem = {
      id: state.item.id,
      title: state.item.title,
      price: state.item.price,
      image: state.item.image,
      branch: activeBranch.name,
      branchId: activeBranch.id,
      date: dateLabel,
      dateStr: selectedDate,
      time: selectedTime,
      quantity: quantity,
      technicianId: technicianIdsStr,
      technicianIds: technicianIdsStr,
      technicianName: technicianName
    };`
);

// 5. Update Select UI component
content = content.replace(
  `<label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn kỹ thuật viên</label>
              <Select
                placeholder="Chọn kỹ thuật viên (tùy chọn)"
                value={selectedKTV || ""}
                onChange={(val) => setSelectedKTV((val as string) || undefined)}
                closeOnSelect={true}
                style={{ width: "100%", fontWeight: 600 }}
              >`,
  `<label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>
                Chọn kỹ thuật viên {quantity > 1 ? \`(Tối đa \${quantity} người)\` : ""}
              </label>
              <Select
                placeholder="Chọn kỹ thuật viên (tùy chọn)"
                value={selectedKTV || ""}
                onChange={(val) => {
                  if (quantity > 1 && Array.isArray(val) && val.length > quantity) {
                    return; // limit selection
                  }
                  setSelectedKTV(val || undefined);
                }}
                multiple={quantity > 1}
                closeOnSelect={quantity <= 1}
                style={{ width: "100%", fontWeight: 600 }}
              >`
);

content = content.replace(
  `</Select>
          </div>

          <div>`,
  `</Select>
            {quantity > 1 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#be185d", fontStyle: "italic" }}>
                Hệ thống ghi nhận mỗi khách hàng đều sẽ được trải nghiệm đồng thời toàn bộ các dịch vụ (không chia mỗi người một dịch vụ).
              </div>
            )}
          </div>

          <div>`
);

fs.writeFileSync('src/shared/components/QuickBookingSheet.tsx', content, 'utf8');
console.log("Updated QuickBookingSheet.tsx");
