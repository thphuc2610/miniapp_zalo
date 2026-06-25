const fs = require('fs');

let content = fs.readFileSync('src/pages/thanhtoan.tsx', 'utf8');

// Fix imports
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

let parts = content.split('const toLocalDateTimeString = (dateStr: string, time: string) => {');
content = prefix + parts.slice(1).join('const toLocalDateTimeString = (dateStr: string, time: string) => {');

// Fix handleFinalizeOrder logic
const oldBlock = /const createdBookings = await Promise\.all\(items\.map\(async \(\w+, \w+\) => \{[\s\S]*?setBookingHistory\(prev => \[\.\.\.newHistoryItems, \.\.\.prev\]\);/;

const newBlock = `const firstItem = items[0];
      const scheduledStart = toLocalDateTimeString(firstItem.dateStr, firstItem.time);
      
      const serviceIds = items.flatMap(item => Array(item.quantity || 1).fill(item.id));
      const totalQuantity = items.length > 0 ? Math.max(...items.map(item => item.quantity || 1)) : 1;
      
      const allNotes = items.map(item => item.note?.trim()).filter(Boolean);
      if (note.trim()) allNotes.push(note.trim());
      const combinedNote = allNotes.join(" | ") || null;
      
      const response = await createSpaBooking({
        fullName: finalCustomerName,
        phone: finalCustomerPhone,
        email: finalCustomerEmail || undefined,
        branchId: firstItem.branchId,
        serviceIds: serviceIds,
        scheduledStart,
        technicianId: firstItem.technicianId || undefined,
        totalPrice: total,
        voucherCode: selectedVoucher ? selectedVoucher.promoCode : null,
        note: combinedNote,
        quantity: totalQuantity,
        guestCount: totalQuantity,
      });

      if (!response.success) {
        throw new Error(response.message || "Không thể đặt lịch.");
      }

      const newHistoryItem: BookingHistoryItem = {
        id: response.bookingId || response.id || "ord_" + Math.random().toString(36).substring(7),
        title: items.length > 1 ? \`\${firstItem.title} và \${items.length - 1} dịch vụ khác\` : firstItem.title,
        price: formatPrice(total),
        date: firstItem.date && firstItem.time ? \`\${firstItem.date} lúc \${firstItem.time}\` : new Date().toLocaleDateString("vi-VN"),
        dateStr: firstItem.dateStr,
        time: firstItem.time,
        quantity: totalQuantity,
        status: "Chờ xác nhận",
        branchId: firstItem.branchId,
        branch: response.branchName || firstItem.branch,
        image: firstItem.image,
        technicianId: firstItem.technicianId || null,
        technicianName: firstItem.technicianName,
        createdAt: new Date().toISOString()
      };

      setBookingHistory(prev => [newHistoryItem, ...prev]);`;

content = content.replace(oldBlock, newBlock);

// Insert warning note in render method
content = content.replace(/ \}\)\)\}\s*<\/div>\s*<\/div>/, ` }))}
            {items.length > 1 && items.some(i => (i.quantity || 1) > 1) && (
              <div style={{ marginTop: 16, padding: "12px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#b91c1c", lineHeight: 1.5, display: "flex", gap: 8 }}>
                <Icon icon="zi-info-circle" style={{ flexShrink: 0, marginTop: 2, color: "#ef4444" }} size={16} />
                <div>
                  <span style={{ fontWeight: 700 }}>Lưu ý:</span> Mỗi khách hàng đều sẽ được trải nghiệm đồng thời <b>toàn bộ các dịch vụ trên</b> (không chia mỗi người một dịch vụ).
                </div>
              </div>
            )}
          </div>
        </div>`);

fs.writeFileSync('src/features/thanhtoan/pages/thanhtoan.tsx', content, 'utf8');
console.log("Fixed thanhtoan.tsx successfully!");
