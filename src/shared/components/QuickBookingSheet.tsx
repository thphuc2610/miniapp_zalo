import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Sheet, Box, useSnackbar, Select } from "zmp-ui";
import { quickBookingState, cartState, checkoutState, QuickBookingState } from "features/datlich/state/booking.state";
import { selectedUserLoginToken } from "features/xacthuc/state/auth.state";
import { selectedBranchState, loginPromptState } from "app/state/app.state";
import { getBusyTechnicianIds, getSpaTechnicians } from "shared/services/spaData";
import { SpaTechnician } from "features/ktv/types/technician";
import { clearStoredSession, isAccessTokenUsable } from "utils/authSession";
import { isBookingDateTimeExpired } from "utils/common";

const { Option } = Select;

const TIME_SLOTS = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const toLocalDateTimeString = (dateStr: string, time: string) => `${dateStr}T${time}:00`;

export const QuickBookingSheet: FC = () => {   
  const [state, setState] = useRecoilState<QuickBookingState>(quickBookingState);
  const selectedBranch = useRecoilValue(selectedBranchState);
  const activeBranch = state.initialBranch || selectedBranch;
  const token = useRecoilValue(selectedUserLoginToken);
  const isAuthenticated = isAccessTokenUsable(token);
  
  const [cart, setCart] = useRecoilState(cartState);
  const setCheckout = useSetRecoilState(checkoutState);
  const { openSnackbar } = useSnackbar();      
  const navigate = useNavigate();
  const setLoginPrompt = useSetRecoilState(loginPromptState);

  const [quantity, setQuantity] = useState(1); 
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedKTV, setSelectedKTV] = useState<string | string[] | undefined>(undefined);
  const [technicians, setTechnicians] = useState<SpaTechnician[]>([]);
  const [busyTechnicianIds, setBusyTechnicianIds] = useState<string[]>([]);
  const [busyTimeSlots, setBusyTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const [daysList, setDaysList] = useState<{ dayLabel: string; dateStr: string; displayDate: string; dayNum: number; isPast: boolean; dateObject: Date }[]>([]);

  useEffect(() => {
    if (state.isOpen) {
      if (!isAuthenticated) {
        clearStoredSession();
        setState((prev) => ({ ...prev, isOpen: false }));
        setLoginPrompt({
          visible: true,
          icon: state.actionType === "cart" ? "cart" : "order",
          title: "Yêu cầu đăng nhập",
          reason: state.actionType === "cart"
            ? "Vui lòng đăng nhập để thêm dịch vụ vào giỏ hàng."
            : "Vui lòng đăng nhập để đặt lịch dịch vụ.",
          redirectTo: state.actionType === "cart" ? "/giohang" : "/datlich",
        });
        return;
      }

      setQuantity(1);
      setSelectedKTV(state.initialTechnicianId || undefined);
      
      getSpaTechnicians().then(data => setTechnicians(data || []));

      const today = new Date();
      const yyyy = today.getFullYear();        
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentHours = today.getHours();   
      const currentMinutes = today.getMinutes();
      const firstValid = TIME_SLOTS.find(slot => {
        const [h, m] = slot.split(":").map(Number);
        return h > currentHours || (h === currentHours && m > currentMinutes);
      });
      const initialDate = state.initialDateStr || "";
      const initialTime = state.initialTime || "";
      if (initialDate && initialTime && !isBookingDateTimeExpired(initialDate, initialTime)) {
        setSelectedDate(initialDate);
        setSelectedTime(initialTime);
      } else if (firstValid) {
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
        setSelectedTime(firstValid);
      } else {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`);
        setSelectedTime(TIME_SLOTS[0]);
      }
    }
  }, [isAuthenticated, state.actionType, state.initialDateStr, state.initialTechnicianId, state.initialTime, state.isOpen, setLoginPrompt, setState]);

  useEffect(() => {
    const days: { dayLabel: string; dateStr: string; displayDate: string; dayNum: number; isPast: boolean; dateObject: Date }[] = [];        
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;   
      const displayDate = `${dd}/${mm}`;       
      const label = i === 6 ? "CN" : `T${i + 2}`;

      days.push({ dayLabel: label, dateStr, displayDate, dayNum: d.getDate(), isPast: d.getTime() < today.getTime(), dateObject: d });       
    }
    setDaysList(days);
  }, [weekStart]);

  useEffect(() => {
    if (!state.isOpen || !state.item || !activeBranch?.id || !selectedDate || !selectedTime) {
      setBusyTechnicianIds([]);
      return;
    }

    let cancelled = false;
    getBusyTechnicianIds({
      branchId: activeBranch.id,
      scheduledStart: toLocalDateTimeString(selectedDate, selectedTime),
      serviceIds: [state.item.id],
      }).then((ids) => {
        if (cancelled) return;
        setBusyTechnicianIds(ids);
        if (selectedKTV) {
          const ktvArray = Array.isArray(selectedKTV) ? selectedKTV : [selectedKTV];
          const validKTVs = ktvArray.filter(id => !ids.includes(String(id)));
          if (validKTVs.length !== ktvArray.length) {
            setSelectedKTV(validKTVs.length > 0 ? (Array.isArray(selectedKTV) ? validKTVs : validKTVs[0]) : undefined);
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeBranch?.id, selectedDate, selectedKTV, selectedTime, state.isOpen, state.item]);

  const isPastSlot = (slot: string) => {
    if (!selectedDate) return false;
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    if (selectedDate !== `${yyyy}-${mm}-${dd}`) return false;

    const [hours, minutes] = slot.split(":").map(Number);
    return hours < d.getHours() || (hours === d.getHours() && minutes <= d.getMinutes());
  };

  useEffect(() => {
    if (!state.isOpen || !state.item || !activeBranch?.id || !selectedDate || !selectedKTV || (Array.isArray(selectedKTV) && selectedKTV.length === 0)) {
      setBusyTimeSlots([]);
      return;
    }

    let cancelled = false;
    Promise.all(TIME_SLOTS.map(async (slot) => {
      if (isPastSlot(slot)) return null;
      const ids = await getBusyTechnicianIds({
        branchId: activeBranch.id,
        scheduledStart: toLocalDateTimeString(selectedDate, slot),
        serviceIds: [state.item!.id],
      });
        const ktvArray = Array.isArray(selectedKTV) ? selectedKTV : [selectedKTV];
        return ktvArray.some(ktvId => ids.includes(String(ktvId))) ? slot : null;
    })).then((slots) => {
      if (cancelled) return;
      const busySlots = slots.filter(Boolean) as string[];
      setBusyTimeSlots(busySlots);
      if (busySlots.includes(selectedTime)) {
        setSelectedTime(TIME_SLOTS.find((slot) => !isPastSlot(slot) && !busySlots.includes(slot)) || selectedTime);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeBranch?.id, selectedDate, selectedKTV, selectedTime, state.isOpen, state.item]);

  const handlePrevWeek = () => setWeekStart((prev) => { const next = new Date(prev); next.setDate(next.getDate() - 7); return next; });      
  const handleNextWeek = () => setWeekStart((prev) => { const next = new Date(prev); next.setDate(next.getDate() + 7); return next; });      

  const getMonthYearLabel = () => {
    if (!daysList.length) return "";
    const midDay = new Date(weekStart);        
    midDay.setDate(midDay.getDate() + 3);      
    return `Tháng ${String(midDay.getMonth() + 1).padStart(2, "0")} - ${midDay.getFullYear()}`;
  };

  const handleClose = () => setState((prev) => ({ ...prev, isOpen: false }));

  const refreshBusyTechnicians = async () => {
    if (!state.item || !activeBranch?.id || !selectedDate || !selectedTime) return [];
    const ids = await getBusyTechnicianIds({
      branchId: activeBranch.id,
      scheduledStart: toLocalDateTimeString(selectedDate, selectedTime),
      serviceIds: [state.item.id],
    });
      setBusyTechnicianIds(ids);
      if (selectedKTV) {
        const ktvArray = Array.isArray(selectedKTV) ? selectedKTV : [selectedKTV];
        const validKTVs = ktvArray.filter(id => !ids.includes(String(id)));
        if (validKTVs.length !== ktvArray.length) {
          setSelectedKTV(validKTVs.length > 0 ? (Array.isArray(selectedKTV) ? validKTVs : validKTVs[0]) : undefined);
        }
      }
      return ids;
  };

  const ensureTechnicianAvailable = async () => {
    if (!selectedKTV || (Array.isArray(selectedKTV) && selectedKTV.length === 0)) return true;
    setCheckingAvailability(true);
    try {
      const ids = await refreshBusyTechnicians();
      const ktvArray = Array.isArray(selectedKTV) ? selectedKTV : [selectedKTV];
      const isBusy = ktvArray.some(ktvId => ids.includes(String(ktvId)));
      if (isBusy) {
        openSnackbar({
          text: "Kỹ thuật viên đã có lịch trong khung giờ này. Vui lòng chọn kỹ thuật viên hoặc giờ khác.",
          type: "error",
          position: "bottom",
        });
        return false;
      }
      return true;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleConfirm = async (actionType: "cart" | "buy") => {
    if (!state.item) return;

    if (!isAuthenticated) {
      clearStoredSession();
      handleClose();
      setLoginPrompt({
        visible: true,
        icon: actionType === "cart" ? "cart" : "order",
        title: "Yêu cầu đăng nhập",
        reason: actionType === "cart"
          ? "Vui lòng đăng nhập để thêm dịch vụ vào giỏ hàng."
          : "Vui lòng đăng nhập để đặt lịch dịch vụ.",
        redirectTo: actionType === "cart" ? "/giohang" : "/datlich",
      });
      return;
    }

    if (!selectedDate) {
      openSnackbar({ text: "Vui lòng chọn ngày", type: "error", position: "bottom" });     
      return;
    }

    if (isBookingDateTimeExpired(selectedDate, selectedTime)) {
      openSnackbar({ text: "Thời gian hẹn đã qua, vui lòng chọn ngày giờ khác.", type: "error", position: "bottom" });
      return;
    }

    if (!activeBranch) {
      openSnackbar({ text: "Vui lòng chọn chi nhánh từ trang chủ", type: "error", position: "bottom" });
      return;
    }

    if (!(await ensureTechnicianAvailable())) return;

    const matchedDate = daysList.find((d) => d.dateStr === selectedDate);
    const dateLabel = matchedDate ? `${matchedDate.dayLabel} (${matchedDate.displayDate})` : selectedDate;

    const technicianName = selectedKTV 
      ? (Array.isArray(selectedKTV)
          ? technicians.filter(t => selectedKTV.includes(String(t.id))).map(t => t.fullName).join(", ")
          : technicians.find(t => String(t.id) === String(selectedKTV))?.fullName || "")
      : "";
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
      technicianId: selectedKTV ? (Array.isArray(selectedKTV) ? selectedKTV.join(", ") : String(selectedKTV)) : null,
      technicianName: technicianName
    };

    if (actionType === "cart") {
      const normalizedId = String(newItem.id).trim();
      const normalizedBranchId = String(newItem.branchId).trim();
      const normalizedKtvId = String(newItem.technicianId || "").trim();
      
      let alreadyExists = false;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => {
          const itemIdMatch = String(item.id).trim() === normalizedId;
          const branchMatch = String(item.branchId).trim() === normalizedBranchId;
          const dateMatch = String(item.dateStr).trim() === String(newItem.dateStr).trim();
          const timeMatch = String(item.time).trim() === String(newItem.time).trim();
          const ktvMatch = String(item.technicianId || "").trim() === normalizedKtvId;
          
          return itemIdMatch && branchMatch && dateMatch && timeMatch && ktvMatch;
        });

        if (existingIndex >= 0) {
          alreadyExists = true;
          return prev.map((item, index) =>
            index === existingIndex
              ? { ...item, ...newItem, quantity: (item.quantity || 1) + (newItem.quantity || 1) }
              : item
          );
        } else {
          return [...prev, newItem];
        }
      });

      handleClose();

      // Dùng setTimeout để đảm bảo message hiển thị đúng sau khi state cập nhật.
      setTimeout(() => {
        openSnackbar({
          text: alreadyExists ? "Đã cập nhật số lượng trong giỏ hàng" : "Đã thêm vào giỏ hàng",
          type: "success",
          duration: 2000,
          position: "bottom"
        });
      }, 100);
    } else {
      setCheckout({ items: [newItem] });       
      handleClose();
      navigate("/thanhtoan");
    }
  };

  if (!state.isOpen || !state.item) return null;

  return (
    <Sheet
      visible={state.isOpen}
      onClose={handleClose}
      mask
      autoHeight
      handler={true}
      title=""
    >
      <Box p={4} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>
            Tùy chọn đặt lịch
          </div>
          <button
            onClick={handleClose}
            style={{
              border: "none", background: "#f3f4f6", color: "#4b5563", width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{
          display: "flex", gap: 12, background: "linear-gradient(135deg, #fdf2f8 0%, #fff 100%)",
          padding: 12, borderRadius: 16, border: "1px solid #fbcfe8", marginBottom: 18        
        }}>
          <img src={state.item.image} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", background: "#f3f4f6" }} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", lineHeight: 1.3, marginBottom: 4 }}>{state.item.title}</div>      

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#be185d" }}>{state.item.price}</span>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 8, border: "1px solid #fce7f3", padding: "2px", width: 76, flexShrink: 0 }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 22, height: 22, borderRadius: "6px", border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#be185d", flex: 1, textAlign: "center" }}>{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} style={{ width: 22, height: 22, borderRadius: "6px", border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>      
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto", paddingBottom: 16 }}>

          {quantity > 1 && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: "#d97706", background: "#fef3c7", padding: "8px 12px", borderRadius: 8, fontStyle: "italic", lineHeight: 1.4 }}>
              *Lưu ý: Số lượng dịch vụ tương đương với số người
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chi nhánh</label>
            <div style={{ padding: "12px 14px", background: "#fff", borderRadius: 12, border: "1px solid #fce7f3", fontSize: 13.5, fontWeight: 700, color: "#be185d" }}>
               {activeBranch?.name || "Chưa chọn chi nhánh"}
            </div>
          </div>

          <div style={{ order: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>
              Chọn kỹ thuật viên
            </label>
              <Select
                multiple={true}
                placeholder={quantity > 1 ? `Chọn tối đa ${quantity} KTV` : "Chọn kỹ thuật viên"}
                value={selectedKTV ? (Array.isArray(selectedKTV) ? selectedKTV : [selectedKTV]) : []}
                onChange={(val) => {
                  if (Array.isArray(val) && val.length > quantity) {
                    openSnackbar({ text: `Chỉ được chọn tối đa ${quantity} kỹ thuật viên.`, type: "warning", position: "bottom" });
                    setSelectedKTV(val.slice(0, quantity));
                  } else {
                    setSelectedKTV((val as string | string[]) || undefined);
                  }
                }}
                closeOnSelect={quantity === 1}
                style={{ width: "100%", fontWeight: 600 }}
              >
                <Option value={""} title="Chọn bất kỳ" />
                {technicians.map((ktv) => {
                  const isBusy = busyTechnicianIds.includes(String(ktv.id));
                  return (
                    <Option key={ktv.id} value={ktv.id} title={isBusy ? `${ktv.fullName} - bận` : ktv.fullName} disabled={isBusy} />
                  );
                })}
              </Select>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn ngày</label>        
            <div style={{ background: "#fff", border: "1px solid #fce7f3", borderRadius: 16, padding: "12px 10px", boxShadow: "0 2px 12px rgba(131, 24, 67, 0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>   
                <button type="button" onClick={handlePrevWeek} style={{ border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#831843", textTransform: "uppercase", letterSpacing: 0.5 }}>{getMonthYearLabel()}</div>
                <button type="button" onClick={handleNextWeek} style={{ border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
                {daysList.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const isToday = new Date().toDateString() === d.dateObject.toDateString();  
                  return (
                    <div key={d.dateStr} onClick={() => { if (!d.isPast) setSelectedDate(d.dateStr); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 0", borderRadius: 12, cursor: d.isPast ? "not-allowed" : "pointer", background: isSelected ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : "transparent", color: isSelected ? "#fff" : d.isPast ? "#d1d5db" : "#4b5563", border: isToday && !isSelected ? "1px solid #be185d" : "1px solid transparent", position: "relative" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{d.dayLabel}</span>
                      <span style={{ fontSize: 13, fontWeight: isSelected || isToday ? 850 : 700 }}>{d.dayNum}</span>
                      {isToday && !isSelected && <div style={{ position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: "#be185d" }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn giờ</label>
            <div style={{ background: "#fff", border: "1px solid #fce7f3", borderRadius: 16, padding: "12px 10px", boxShadow: "0 2px 12px rgba(131, 24, 67, 0.02)" }}>
              <div style={{
                display: "flex",
                overflowX: "auto",
                gap: 8,
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",        
                msOverflowStyle: "none"        
              }}>
                <style>
                  {`
                    ::-webkit-scrollbar { display: none; }
                  `}
                </style>
                {TIME_SLOTS.map((slot) => {    
                  const isSelected = selectedTime === slot;

                  const isPastTime = isPastSlot(slot);
                  const isBusyTime = selectedKTV ? (Array.isArray(selectedKTV) ? busyTimeSlots.includes(slot) : busyTimeSlots.includes(slot)) : false;
                  const isDisabled = isPastTime || isBusyTime;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => { if (!isDisabled) setSelectedTime(slot); }}
                      style={{
                        border: "none",        
                        background: isSelected ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : (isDisabled ? "#e5e7eb" : "#fdf2f8"), 
                        color: isSelected ? "#fff" : (isDisabled ? "#9ca3af" : "#be185d"),    
                        padding: "8px 20px",   
                        borderRadius: 10,      
                        fontSize: 13,
                        fontWeight: 800,       
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        boxShadow: isSelected ? "0 2px 6px rgba(190, 24, 93, 0.2)" : "none",  
                        flexShrink: 0,
                        opacity: isDisabled ? 0.55 : 1
                      }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {(state.actionType === "cart" || state.actionType === "both") && (
            <button
              onClick={() => handleConfirm("cart")}
              disabled={checkingAvailability}
              style={{
                flex: 1,
                height: 48,
                background: state.actionType === "both" ? "#fdf2f8" : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                color: state.actionType === "both" ? "#be185d" : "#fff",
                border: state.actionType === "both" ? "1px solid #fbcfe8" : "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: checkingAvailability ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",      
                transition: "all 0.2s ease"    
              }}
            >
              {checkingAvailability ? "Đang kiểm tra..." : "Thêm vào giỏ hàng"}
            </button>
          )}

          {(state.actionType === "buy" || state.actionType === "both") && (
            <button
              onClick={() => handleConfirm("buy")}
              disabled={checkingAvailability}
              style={{
                flex: 1,
                height: 48,
                background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: checkingAvailability ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",      
                transition: "all 0.2s ease"    
              }}
            >
              {checkingAvailability ? "Đang kiểm tra..." : "Đặt ngay"}
            </button>
          )}
        </div>

      </Box>
    </Sheet>
  );
};
