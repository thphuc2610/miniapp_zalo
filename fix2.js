const fs = require('fs');
let content = fs.readFileSync('src/features/thanhtoan/pages/thanhtoan.tsx', 'utf8');

const prefix = `import React, { FC, useState, useEffect } from "react";
import { Page, Header, useSnackbar, Sheet, Box, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  checkoutState,
  cartState,
  bookingHistoryState,
  BookingHistoryItem,
} from "features/datlich/state/booking.state";
import {
  ATOM_USER_INFO,
  phoneNumberAtom
} from "features/xacthuc/state/auth.state";
import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, SpaPromo } from "service/spaData";
import type { CustomerProfile } from "service/spaData";
import { VoucherSheet } from "components/VoucherSheet";
import { isBookingDateTimeExpired } from "utils/common";

const toLocalDateTimeString = (dateStr: string, time: string) => {`;

if (!content.includes('import React')) {
  content = prefix + '\n' + content.replace('  return `${dateStr}T${time}:00`;', '  return `${dateStr}T${time}:00`;');
  fs.writeFileSync('src/features/thanhtoan/pages/thanhtoan.tsx', content, 'utf8');
  console.log("Fixed successfully.");
} else {
  console.log("Already has imports.");
}
