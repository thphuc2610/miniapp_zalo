const fs = require('fs');

let statePath = 'src/features/datlich/state/booking.state.ts';
let stateFile = fs.readFileSync(statePath, 'utf8');

// Replace the mangled checkoutState definition and add BookingHistoryItem
const mangledRegex = /export const checkoutState = atom<\{ items: CartItem\[\] \}>\(\{\s*key: "checkoutState",\s*time\?: string;/;

const fixedContent = `export const checkoutState = atom<{ items: CartItem[] }>({
  key: "checkoutState",
  default: { items: [] }
});

export interface BookingHistoryItem {
  id: string;
  serviceId?: string;
  title: string;
  fullTitle?: string;
  price: string;
  date: string;
  status: "Chờ xác nhận" | "Đã xác nhận" | "Đang phục vụ" | "Đã hoàn thành" | "Đã hủy";
  rawStatus?: string;
  scheduledStart?: string;
  dateStr?: string;
  time?: string;`;

stateFile = stateFile.replace(mangledRegex, fixedContent);

// Fix double fullTitle in CartItem
stateFile = stateFile.replace('  fullTitle?: string;\n  fullTitle?: string;', '  fullTitle?: string;');

fs.writeFileSync(statePath, stateFile, 'utf8');

console.log("Done fixing booking.state.ts");
