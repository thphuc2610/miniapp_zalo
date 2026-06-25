const fs = require('fs');

// 1. Fix QuickBookingSheet.tsx
let qbsPath = 'src/shared/components/QuickBookingSheet.tsx';
let qbs = fs.readFileSync(qbsPath, 'utf8');

// Fix imports
qbs = qbs.replace(/import \{ quickBookingState.*?\} from "features\/datlich\/state\/booking\.state";/, 
  'import { quickBookingState, cartState, checkoutState, QuickBookingState } from "features/datlich/state/booking.state";');
qbs = qbs.replace(/import \{ selectedBranchState.*?\} from "features\/xacthuc\/state\/auth\.state";/,
  'import { selectedUserLoginToken } from "features/xacthuc/state/auth.state";\nimport { selectedBranchState, loginPromptState } from "app/state/app.state";');
qbs = qbs.replace(/import \{ getBusyTechnicianIds.*?\} from "shared\/services\/spaData";/,
  'import { getBusyTechnicianIds, getSpaTechnicians } from "shared/services/spaData";\nimport { SpaTechnician } from "features/ktv/types/technician";');

// Fix newItem
qbs = qbs.replace(/const technicianName = selectedKTV \? technicians\.find.*?;\s*const newItem = \{[\s\S]*?technicianName: technicianName\s*\};/,
  `const technicianName = selectedKTV 
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
      technicianName: technicianName
    };`);

// Fix TS errors for `activeBranch?.name` since it's `SpaBranch` but TS doesn't know it
qbs = qbs.replace(/\{activeBranch\?\.name \|\| "Chưa chọn chi nhánh"\}/g, '{activeBranch ? (activeBranch as any).name : "Chưa chọn chi nhánh"}');

fs.writeFileSync(qbsPath, qbs, 'utf8');


// 2. Fix lichsudon.tsx imports
let lsPath = 'src/pages/lichsudon.tsx';
let ls = fs.readFileSync(lsPath, 'utf8');

ls = ls.replace(/import \{ bookingHistoryState, quickBookingState, type BookingHistoryItem \} from "state";/,
  'import { bookingHistoryState, quickBookingState, type BookingHistoryItem } from "features/datlich/state/booking.state";');

fs.writeFileSync(lsPath, ls, 'utf8');


// 3. Update CartItem interface
let statePath = 'src/features/datlich/state/booking.state.ts';
let stateFile = fs.readFileSync(statePath, 'utf8');

if (!stateFile.includes('technicianIds?: string | null;')) {
  stateFile = stateFile.replace('technicianName?: string | null;', 'technicianName?: string | null;\n  technicianIds?: string | null;\n  technicianNames?: string | null;');
  fs.writeFileSync(statePath, stateFile, 'utf8');
}

console.log("Done fixing.");
