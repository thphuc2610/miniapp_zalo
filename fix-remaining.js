const fs = require('fs');

// 1. booking.state.ts
let statePath = 'src/features/datlich/state/booking.state.ts';
let stateFile = fs.readFileSync(statePath, 'utf8');
if (!stateFile.includes('fullTitle?: string;')) {
  stateFile = stateFile.replace('title: string;', 'title: string;\n  fullTitle?: string;');
  fs.writeFileSync(statePath, stateFile, 'utf8');
}

// 2. thanhtoan.tsx
let ttPath = 'src/features/thanhtoan/pages/thanhtoan.tsx';
let tt = fs.readFileSync(ttPath, 'utf8');

// Update useEffect for "me"
const oldUseEffect = `  useEffect(() => {
    if (bookingFor === "me") {
      setCustomerName(userDisplayName);
      setCustomerPhone(userPhone || "");
      setCustomerEmail("");
      return;
    }

    setCustomerName(items[0]?.customerName || "");
    setCustomerPhone(items[0]?.customerPhone || "");
    setCustomerEmail(items[0]?.customerEmail || "");
  }, [bookingFor, items, userDisplayName, userPhone]);`;

const newUseEffect = `  useEffect(() => {
    if (bookingFor === "me") {
      getCustomerProfile().then(profile => {
        setCustomerName(profile?.fullName || userDisplayName);
        setCustomerPhone(profile?.phoneNumber || userPhone || "");
        setCustomerEmail(profile?.email || "");
      });
      return;
    }

    setCustomerName(items[0]?.customerName || "");
    setCustomerPhone(items[0]?.customerPhone || "");
    setCustomerEmail(items[0]?.customerEmail || "");
  }, [bookingFor, items, userDisplayName, userPhone]);`;

tt = tt.replace(oldUseEffect, newUseEffect);

// Update newHistoryItem
const historyItemRegex = /const newHistoryItem: BookingHistoryItem = \{\s*id: response\.bookingId \|\| response\.id \|\| "ord_" \+ Math\.random\(\)\.toString\(36\)\.substring\(7\),\s*title: items\.length > 1 \? `\$\{firstItem\.title\} và \$\{items\.length - 1\} dịch vụ khác` : firstItem\.title,/;

const newHistoryItemStr = `const newHistoryItem: BookingHistoryItem = {
        id: response.bookingId || response.id || "ord_" + Math.random().toString(36).substring(7),
        title: items.length > 1 ? \`\${firstItem.title} và \${items.length - 1} dịch vụ khác\` : firstItem.title,
        fullTitle: items.map(i => i.title).join("\\n"),`;

tt = tt.replace(historyItemRegex, newHistoryItemStr);

fs.writeFileSync(ttPath, tt, 'utf8');


// 3. lichsudon.tsx
let lsPath = 'src/pages/lichsudon.tsx';
let ls = fs.readFileSync(lsPath, 'utf8');

const detailMappingRegex = /\["Dịch vụ", detail\.title\],\s*\["Kỹ thuật viên", detail\.technicianName \|\| "Chưa gán"\],/;
const newDetailMapping = `["Dịch vụ", detail.fullTitle || detail.title],
              ["Kỹ thuật viên", detail.technicianName || "Chưa gán"],`;

ls = ls.replace(detailMappingRegex, newDetailMapping);

const renderValueRegex = /<span style=\{\{ fontSize: 13, color: "#1f2937", fontWeight: 700, textAlign: "left", lineHeight: 1\.45, wordBreak: "break-word" \}\}>\{value\}<\/span>/;
const newRenderValue = `<span style={{ fontSize: 13, color: "#1f2937", fontWeight: 700, textAlign: "left", lineHeight: 1.45, wordBreak: "break-word" }}>
                  {typeof value === "string" && (label === "Dịch vụ" || label === "Kỹ thuật viên") 
                    ? value.split(/[\\n]+/).map((part: string, idx: number) => (
                        <div key={idx} style={{ marginBottom: 4 }}>{part.trim()}</div>
                      )) 
                    : value}
                </span>`;

ls = ls.replace(renderValueRegex, newRenderValue);

// Also handle comma separated technician names: in QuickBookingSheet, technicianName is joined by ", ". Let's make it split by comma or newline.
const renderValueRegex2 = /value\.split\(\/\[\\\\n\]\+\/\)/;
const newRenderValue2 = 'value.split(/[\\n,]+/)';
ls = ls.replace(renderValueRegex2, newRenderValue2);

fs.writeFileSync(lsPath, ls, 'utf8');

console.log("Done fixing remaining tasks.");
