const fs = require('fs');
let content = fs.readFileSync('src/pages/thanhtoan.tsx', 'utf8');

// Fix imports
content = content.replace('from "state";', 'from "features/datlich/state/booking.state";');
content = content.replace('import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, getCustomerProfile } from "service/spaData";', 'import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, getCustomerProfile } from "service/spaData";');

// Replace handleFinalizeOrder logic
const oldBlock = /const createdBookings = await Promise\.all\(items\.map\(async \(\w+, \w+\) => \{[\s\S]*?setBookingHistory\(prev => \[\.\.\.newHistoryItems, \.\.\.prev\]\);/;

const newBlock = `const firstItem = items[0];
      const scheduledStart = toLocalDateTimeString(firstItem.dateStr, firstItem.time);
      
      const serviceIds = items.flatMap(item => Array(item.quantity || 1).fill(item.id));
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
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

      const newHistoryItem = {
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

fs.writeFileSync('src/features/thanhtoan/pages/thanhtoan.tsx', content, 'utf8');
