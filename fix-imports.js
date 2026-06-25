const fs = require('fs');

let thanhtoanPath = 'src/features/thanhtoan/pages/thanhtoan.tsx';
let datlichPath = 'src/features/datlich/pages/datlich.tsx';

let thanhtoanContent = fs.readFileSync(thanhtoanPath, 'utf8');
let datlichContent = fs.readFileSync(datlichPath, 'utf8');

// Fix thanhtoan imports
thanhtoanContent = thanhtoanContent.replace(
  /import \{\n  checkoutState,\n  cartState,\n  bookingHistoryState,\n  BookingHistoryItem,\n  ATOM_USER_INFO,\n  phoneNumberAtom,\n  userProfileState\n\} from "state";/,
  `import { checkoutState, cartState, bookingHistoryState, BookingHistoryItem } from "features/datlich/state/booking.state";\nimport { ATOM_USER_INFO, phoneNumberAtom, userProfileState } from "features/xacthuc/state/auth.state";`
);

thanhtoanContent = thanhtoanContent.replace(
  /import \{\n  checkoutState,\n  cartState,\n  bookingHistoryState,\n  BookingHistoryItem,\n  ATOM_USER_INFO,\n  phoneNumberAtom\n\} from "state";/,
  `import { checkoutState, cartState, bookingHistoryState, BookingHistoryItem } from "features/datlich/state/booking.state";\nimport { ATOM_USER_INFO, phoneNumberAtom, userProfileState } from "features/xacthuc/state/auth.state";`
);

// Fix datlich imports
datlichContent = datlichContent.replace(
  /import \{ checkoutState, selectedBranchState \} from "state";/,
  `import { checkoutState } from "features/datlich/state/booking.state";\nimport { selectedBranchState } from "app/state/app.state";`
);

// wait, are there other things imported from "state" or "service/spaData" in the old files vs new?
// In thanhtoan: checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, SpaPromo from "service/spaData"
thanhtoanContent = thanhtoanContent.replace(
  /from "service\/spaData"/g,
  'from "shared/services/spaData"'
);
thanhtoanContent = thanhtoanContent.replace(
  /from "components\/VoucherSheet"/g,
  'from "shared/components/VoucherSheet"'
);

// In datlich: getSpaServices, getSpaTechnicians, TIME_SLOTS, getBusyTechnicianIds, checkSpaPromoCode from "service/spaData"
datlichContent = datlichContent.replace(
  /from "service\/spaData"/g,
  'from "shared/services/spaData"'
);

fs.writeFileSync(thanhtoanPath, thanhtoanContent, 'utf8');
fs.writeFileSync(datlichPath, datlichContent, 'utf8');

console.log("Done fixing imports");
