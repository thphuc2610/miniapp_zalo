import React, { FC, useState, useEffect } from "react";
import { Page, Header, useSnackbar, Sheet, Box, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { checkoutState, cartState, bookingHistoryState, BookingHistoryItem, datlichFormState } from "features/datlich/state/booking.state";
import { ATOM_USER_INFO, phoneNumberAtom, userProfileState } from "features/xacthuc/state/auth.state";
import { checkSpaPromoCode, createSpaBooking, getBusyTechnicianIds, SpaPromo } from "shared/services/spaData";
import { VoucherSheet } from "shared/components/VoucherSheet";
import { isBookingDateTimeExpired } from "utils/common";

const toLocalDateTimeString = (dateStr: string, time: string) => {
  return `${dateStr}T${time}:00`;
};

const getUserDisplayName = (userInfo: unknown, phone?: string) => {
  const source = (userInfo as any)?.userInfo || userInfo as any;
  const name = String(source?.name || source?.fullName || "").trim();
  return name && name !== phone ? name : "";
};

const normalizePhoneInput = (value: string) => value.replace(/[^\d]/g, "").slice(0, 10);
const isValidVietnamPhone = (value: string) => /^0\d{9}$/.test(value);
const isVoucherExpired = (promo?: SpaPromo | null) => {
  if (!promo?.expiryDate) return false;
  const expiry = new Date(promo.expiryDate);
  return Number.isNaN(expiry.getTime()) ? false : expiry.getTime() < Date.now();
};

export const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  const { items } = useRecoilValue(checkoutState);
  const setCheckout = useSetRecoilState(checkoutState);
  const setCart = useSetRecoilState(cartState);
  const setDatlichForm = useSetRecoilState(datlichFormState);
  const setBookingHistory = useSetRecoilState(bookingHistoryState);
  const userInfo = useRecoilValue(ATOM_USER_INFO);
  const userPhone = useRecoilValue(phoneNumberAtom);
  const userProfile = useRecoilValue(userProfileState);
  const userDisplayName = userProfile?.fullName || getUserDisplayName(userInfo, userPhone);
  const userEmail = userProfile?.email || "";

  const checkoutContact = items[0]?.customerName && items[0]?.customerPhone
    ? {
      name: items[0].customerName,
      phone: items[0].customerPhone,
      fullAddress: items[0].branch || "",
    }
    : null;
  const userContact = userPhone
    ? {
      name: userDisplayName,
      phone: userPhone,
      fullAddress: items[0]?.branch || "",
    }
    : null;
  const bookingContact = checkoutContact || userContact;
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [bookingFor, setBookingFor] = useState<"me" | "other">("me");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Promo States
  const [promoInput, setPromoInput] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<SpaPromo | null>(null);
  const [voucherSearchResult, setVoucherSearchResult] = useState<SpaPromo | null>(null);
  const [voucherSearchStatus, setVoucherSearchStatus] = useState("");
  const [isSearchingVoucher, setIsSearchingVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sheet states
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isVoucherSheetOpen, setIsVoucherSheetOpen] = useState(false);

  useEffect(() => {
    const firstItem = items[0];
    if (firstItem?.customerName && firstItem?.customerPhone && firstItem.customerPhone !== userPhone) {
      setBookingFor("other");
    } else {
      setBookingFor("me");
    }
  }, [items, userPhone]);

  useEffect(() => {
    if (bookingFor === "me") {
      setCustomerName(userDisplayName);
      setCustomerPhone(userPhone || "");
      setCustomerEmail(userEmail);
      return;
    }

    setCustomerName(items[0]?.customerName || "");
    setCustomerPhone(items[0]?.customerPhone || "");
    setCustomerEmail(items[0]?.customerEmail || "");
  }, [bookingFor, userDisplayName, userPhone, userEmail, items]);

  useEffect(() => {
    const code = promoInput.trim();
    if (!isVoucherSheetOpen || !code) {
      setVoucherSearchResult(null);
      setVoucherSearchStatus("");
      setIsSearchingVoucher(false);
      return;
    }

    let cancelled = false;
    setIsSearchingVoucher(true);
    setVoucherSearchStatus("");
    const timeoutId = window.setTimeout(async () => {
      try {
        const promo = await checkSpaPromoCode(code);
        if (cancelled) return;
        setVoucherSearchResult(promo);
        setVoucherSearchStatus(promo ? "" : "Không tìm thấy mã ưu đãi phù hợp.");
      } catch (error) {
        if (cancelled) return;
        setVoucherSearchResult(null);
        setVoucherSearchStatus(error instanceof Error ? error.message : "Không tìm thấy mã ưu đãi phù hợp.");
      } finally {
        if (!cancelled) setIsSearchingVoucher(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isVoucherSheetOpen, promoInput]);

  // Calculate totals
  const subTotal = items.reduce((sum, item) => {
    const p = parseInt(String(item.price || "0").replace(/[^\d]/g, ""));
    return sum + (isNaN(p) ? 0 : p * (item.quantity || 1));
  }, 0);

  const calculateDiscountForPromo = (promo: SpaPromo, subtotal: number) => {
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) return 0;
    const value = Number(promo.discountValue || 0);
    if (promo.discountType === "percent") return Math.round(subtotal * value / 100);
    return value;
  };

  const shippingFee = 0;
  const discount = selectedVoucher ? calculateDiscountForPromo(selectedVoucher, subTotal) : 0;
  const total = Math.max(0, subTotal + shippingFee - discount);

  const formatPrice = (p: number) => new Intl.NumberFormat("vi-VN").format(p) + "đ";

  const handleFinalizeOrder = async () => {
    const finalCustomerName = customerName.trim();
    const finalCustomerPhone = customerPhone.trim();
    const finalCustomerEmail = customerEmail.trim();

    if (!finalCustomerName) {
      openSnackbar({ text: "Vui lòng nhập họ và tên.", type: "error" });
      return;
    }
    if (!finalCustomerPhone) {
      openSnackbar({ text: "Vui lòng nhập số điện thoại.", type: "error" });
      return;
    }
    if (!isValidVietnamPhone(finalCustomerPhone)) {
      openSnackbar({ text: "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.", type: "error" });
      return;
    }

    const invalidItem = items.find((item) => !item.branchId || !item.dateStr || !item.time);
    if (invalidItem) {
      openSnackbar({ text: "Dịch vụ thiếu chi nhánh hoặc thời gian.", type: "error" });
      return;
    }

    const expiredItem = items.find((item) => isBookingDateTimeExpired(item.dateStr, item.time));
    if (expiredItem) {
      openSnackbar({ text: `Lịch hẹn của ${expiredItem.title || "dịch vụ"} đã qua, vui lòng chọn lại ngày giờ.`, type: "error" });
      return;
    }

    for (const item of items) {
      if (!item.technicianId) continue;
      const busyIds = await getBusyTechnicianIds({
        branchId: item.branchId!,
        scheduledStart: toLocalDateTimeString(item.dateStr!, item.time!),
        serviceIds: [item.id],
      });
      const techIds = String(item.technicianId).split(",").map(id => id.trim()).filter(Boolean);
      const busySelected = techIds.filter(id => busyIds.includes(id));
      if (busySelected.length > 0) {
        openSnackbar({
          text: `Kỹ thuật viên của ${item.title || "dịch vụ"} đã có lịch trong khung giờ này. Vui lòng chọn lại.`,
          type: "error",
        });
        return;
      }
    }

    if (selectedVoucher && isVoucherExpired(selectedVoucher)) {
      setSelectedVoucher(null);
      openSnackbar({ text: "Mã giảm giá đã hết hạn.", type: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      let allocatedDiscount = 0;

      const firstItem = items[0];
      const scheduledStart = toLocalDateTimeString(firstItem.dateStr!, firstItem.time!);
      const combinedNote = items.map(i => i.note?.trim()).filter(Boolean).join(" | ");
      const finalNote = [combinedNote, note.trim()].filter(Boolean).join(" | ") || null;
      const guestCount = firstItem.quantity || 1;

      const response = await createSpaBooking({
        fullName: finalCustomerName,
        phone: finalCustomerPhone,
        email: finalCustomerEmail || undefined,
        branchId: firstItem.branchId!,
        serviceIds: items.map(i => i.id),
        scheduledStart,
        technicianId: firstItem.technicianId ? String(firstItem.technicianId).split(",")[0].trim() : undefined,
        technicianIds: firstItem.technicianId || undefined,
        quantity: guestCount,
        guestCount: guestCount,
        totalPrice: total,
        voucherCode: selectedVoucher ? selectedVoucher.promoCode : null,
        note: finalNote,
      });

      if (!response.success) {
        throw new Error(response.message || "Không thể đặt lịch.");
      }

      const newHistoryItem: BookingHistoryItem = {
        id: response.bookingId || response.id || "ord_" + Math.random().toString(36).substring(7),
        title: items.map(i => i.title).join(", "),
        price: formatPrice(total),
        date: firstItem.date && firstItem.time ? `${firstItem.date} lúc ${firstItem.time}` : new Date().toLocaleDateString("vi-VN"),
        dateStr: firstItem.dateStr,
        time: firstItem.time,
        status: "Chờ xác nhận",
        branchId: firstItem.branchId,
        branch: response.branchName || firstItem.branch,
        image: firstItem.image,
        technicianId: firstItem.technicianId || null,
        technicianName: firstItem.technicianName,
        createdAt: new Date().toISOString()
      };

      setBookingHistory(prev => [newHistoryItem, ...prev]);
      setCart(prev => prev.filter(cartItem => !items.includes(cartItem)));
      setCheckout({ items: [] });
      setDatlichForm({
        selectedServices: [],
        selectedKTVs: [],
        guestCount: 1,
        selectedDate: "",
        selectedTime: "09:00",
      });
      openSnackbar({ text: "Đặt lịch thành công!", type: "success" });
      navigate("/lichsudon", { replace: true });
    } catch (error) {
      openSnackbar({ text: error instanceof Error ? error.message : "Không thể lưu lịch hẹn.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const applyVoucher = (promo: SpaPromo | null) => {
    if (!promo) {
      openSnackbar({ text: "Mã giảm giá không chính xác", type: "warning" });
      return;
    }
    if (promo.isOutOfStock) {
      openSnackbar({ text: "Mã giảm giá đã hết lượt sử dụng.", type: "warning" });
      return;
    }
    if (isVoucherExpired(promo)) {
      openSnackbar({ text: "Mã giảm giá đã hết hạn.", type: "warning" });
      return;
    }
    if (promo.minOrderAmount && subTotal < promo.minOrderAmount) {
      openSnackbar({ text: `Đơn tối thiểu để dùng mã này là ${formatPrice(promo.minOrderAmount)}.`, type: "warning" });
      return;
    }
    setSelectedVoucher(promo);
    openSnackbar({ text: `Áp dụng thành công: ${promo.title}`, type: "success" });
  };

  const handleApplyManualPromo = async () => {
    try {
      applyVoucher(voucherSearchResult || await checkSpaPromoCode(promoInput));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tìm thấy mã ưu đãi phù hợp.";
      setVoucherSearchResult(null);
      setVoucherSearchStatus(message);
      openSnackbar({ text: message, type: "warning" });
    }
  };

  if (items.length === 0) {
    return (
      <Page style={{ padding: 20, textAlign: "center", background: "#fdf2f8" }}>
        <Header title="Thanh toán" />
        <p style={{ marginTop: 60 }}>Không có dịch vụ nào để thanh toán.</p>
        <button onClick={() => navigate("/")} style={{ background: "#be185d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 10, marginTop: 20 }}>Quay lại trang chủ</button>
      </Page>
    );
  }

  return (
    <Page style={{ background: "#fdf2f8", minHeight: "100vh", paddingBottom: 240, overflowX: "hidden" }}>
      <Header title="Thanh toán" showBackIcon style={{ background: "var(--color-2)", fontWeight: 700, textAlign: "center" }} />

      <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden", padding: "16px 6px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Address Card Section (Restored as per user request) */}
        <div
          onClick={() => { }}
          style={{ display: "none" }}
        >
          <div style={{ height: 4, width: "100%", background: "repeating-linear-gradient(45deg, #6fa6d6, #6fa6d6 33px, transparent 0, transparent 41px, #f18d9b 0, #f18d9b 74px, transparent 0, transparent 82px)" }} />

          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#be185d", background: "#fdf2f8", padding: 8, borderRadius: "50%" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div style={{ flex: 1 }}>
              {bookingContact ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>
                    {bookingContact.name} &nbsp;&nbsp;&nbsp;&nbsp; <span style={{ color: "#6b7280", fontWeight: 500 }}>{bookingContact.phone}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.4 }}>{bookingContact.fullAddress}</div>
                </>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 700, color: "#be185d" }}>+ Chọn địa chỉ nhận dịch vụ</div>
              )}
            </div>
            <div style={{ color: "#9ca3af" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", boxShadow: "0 2px 12px rgba(131,24,67,0.02)", padding: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12 }}>Thông tin</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setBookingFor("me")}
              style={{ flex: 1, minWidth: 0, padding: "10px", borderRadius: 12, border: bookingFor === "me" ? "2px solid #be185d" : "1px solid #d1d5db", background: bookingFor === "me" ? "#fdf2f8" : "#fff", color: bookingFor === "me" ? "#be185d" : "#4b5563", fontWeight: 700, transition: "all 0.2s ease" }}
            >
              Đặt cho tôi
            </button>
            <button
              type="button"
              onClick={() => setBookingFor("other")}
              style={{ flex: 1, minWidth: 0, padding: "10px", borderRadius: 12, border: bookingFor === "other" ? "2px solid #be185d" : "1px solid #d1d5db", background: bookingFor === "other" ? "#fdf2f8" : "#fff", color: bookingFor === "other" ? "#be185d" : "#4b5563", fontWeight: 700, transition: "all 0.2s ease" }}
            >
              Đặt cho người khác
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              placeholder="Họ và tên"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, outline: "none", background: "#f9fafb" }}
            />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Số điện thoại"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(normalizePhoneInput(event.target.value))}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, outline: "none", background: "#f9fafb" }}
            />
            <input
              type="email"
              placeholder="Email (nếu có)"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, outline: "none", background: "#f9fafb" }}
            />
            <textarea
              placeholder="Ghi chú / yêu cầu đặc biệt"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, outline: "none", background: "#f9fafb", minHeight: 76, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
        {/* Order Details */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", boxShadow: "0 2px 12px rgba(131,24,67,0.02)" }}>
          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12 }}>Dịch vụ đã chọn</div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, minWidth: 0, marginBottom: idx !== items.length - 1 ? 16 : 0 }}>
                <img src={item.image} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.4 }}>{item.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "#be185d", fontWeight: 700 }}>{item.price}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>x{item.quantity || 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Options */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", boxShadow: "0 2px 12px rgba(131,24,67,0.02)" }}>
          <div onClick={() => setIsVoucherSheetOpen(true)} style={{ padding: "14px 16px", borderBottom: "1px solid #fdf2f8", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Voucher</span>
            <span style={{ fontSize: 13, color: selectedVoucher ? "#059669" : "#6b7280" }}>{selectedVoucher ? `-${formatPrice(discount)}` : "Chọn mã"} <Icon icon="zi-chevron-right" size={16} /></span>
          </div>
          <div onClick={() => setIsPaymentSheetOpen(true)} style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Phương thức thanh toán</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#be185d" }}>{paymentMethod} <Icon icon="zi-chevron-right" size={16} /></span>
          </div>
        </div>

      </div>

      {/* Bottom Action */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #fce7f3", padding: "16px", boxShadow: "0 -4px 12px rgba(131, 24, 67, 0.05)", zIndex: 50, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, color: "#6b7280" }}>Tạm tính</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(subTotal)}</span></div>
        {selectedVoucher && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, color: "#6b7280" }}>Giảm giá</span><span style={{ fontSize: 13, color: "#059669" }}>-{formatPrice(discount)}</span></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #e5e7eb", paddingTop: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#4b5563" }}>Tổng cộng:</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#be185d" }}>{formatPrice(total)}</span>
        </div>
        <button
          onClick={handleFinalizeOrder}
          disabled={submitting}
          style={{
            width: "100%", height: 48, background: submitting ? "#d1d5db" : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800,
            boxShadow: "0 4px 12px rgba(190, 24, 93, 0.3)",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.75 : 1,
          }}
        >
          {submitting ? "Đang xử lý..." : "Đặt lịch ngay"}
        </button>
      </div>

      <VoucherSheet isOpen={isVoucherSheetOpen} onClose={() => setIsVoucherSheetOpen(false)} selectedPromo={selectedVoucher} onSelectPromo={(promo) => promo ? applyVoucher(promo) : setSelectedVoucher(null)} promoInput={promoInput} onPromoInputChange={setPromoInput} onApplyManualPromo={handleApplyManualPromo} searchResult={voucherSearchResult} searchStatusText={voucherSearchStatus} isSearching={isSearchingVoucher} />

      <Sheet visible={isPaymentSheetOpen} onClose={() => setIsPaymentSheetOpen(false)} autoHeight>
        <Box p={4} style={{ paddingBottom: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#831843", marginBottom: 16 }}>Phương thức thanh toán</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["COD", "Chuyển khoản VietQR"].map(m => (
              <div key={m} onClick={() => { setPaymentMethod(m); setIsPaymentSheetOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: 16, border: paymentMethod === m ? "2px solid #be185d" : "1px solid #e5e7eb", background: paymentMethod === m ? "#fdf2f8" : "#fff", cursor: "pointer" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: paymentMethod === m ? "6px solid #be185d" : "2px solid #d1d5db", background: "#fff" }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>{m}</span>
              </div>
            ))}
          </div>
        </Box>
      </Sheet>
    </Page>
  );
};
export default CheckoutPage;
