import React, { FC, useState, useEffect } from "react";
import { Page, Box, Header, useSnackbar, Select, Sheet } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { checkoutState, selectedBranchState } from "state";
import {
  getSpaServices,
  getSpaTechnicians,
  getBusyTechnicianIds,
  SpaService,
  SpaTechnician,
} from "service/spaData";
import { isBookingDateTimeExpired } from "utils/common";

const { Option } = Select;

const TIME_SLOTS = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const toLocalDateTimeString = (dateStr: string, time: string) => `${dateStr}T${time}:00`;

export const DatlichPage: FC = () => {
  const selectedBranch = useRecoilValue(selectedBranchState);

  const navigate = useNavigate();
  const setCheckout = useSetRecoilState(checkoutState);
  const { openSnackbar } = useSnackbar();      

  const [services, setServices] = useState<SpaService[]>([]);
  const [technicians, setTechnicians] = useState<SpaTechnician[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedKTV, setSelectedKTV] = useState<string | undefined>(undefined);
  const [busyTechnicianIds, setBusyTechnicianIds] = useState<string[]>([]);
  const [busyTimeSlots, setBusyTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [guestCount, setGuestCount] = useState(1);

  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const [daysList, setDaysList] = useState<{ dayLabel: string; dateStr: string; displayDate: string; dayNum: number; isPast: boolean; dateObject: Date }[]>([]);
useEffect(() => {
    setLoadingServices(true);
    Promise.all([getSpaServices(), getSpaTechnicians()])
      .then(([svcs, technicianItems]) => {
        setServices(svcs || []);
        setTechnicians(technicianItems || []);
        setLoadingServices(false);
      })
      .catch(() => setLoadingServices(false));

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
    if (firstValid) {
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
      setSelectedTime(firstValid);
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`);
      setSelectedTime(TIME_SLOTS[0]);
    }
  }, []);

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
    if (!selectedBranch?.id || !selectedDate || !selectedTime || selectedServices.length === 0) {
      setBusyTechnicianIds([]);
      return;
    }

    let cancelled = false;
    getBusyTechnicianIds({
      branchId: selectedBranch.id,
      scheduledStart: toLocalDateTimeString(selectedDate, selectedTime),
      serviceIds: selectedServices,
    }).then((ids) => {
      if (cancelled) return;
      setBusyTechnicianIds(ids);
      if (selectedKTV && ids.includes(String(selectedKTV))) {
        setSelectedKTV(undefined);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedBranch?.id, selectedDate, selectedKTV, selectedServices, selectedTime]);

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
    if (!selectedBranch?.id || !selectedDate || !selectedKTV || selectedServices.length === 0) {
      setBusyTimeSlots([]);
      return;
    }

    let cancelled = false;
    Promise.all(TIME_SLOTS.map(async (slot) => {
      if (isPastSlot(slot)) return null;
      const ids = await getBusyTechnicianIds({
        branchId: selectedBranch.id,
        scheduledStart: toLocalDateTimeString(selectedDate, slot),
        serviceIds: selectedServices,
      });
      return ids.includes(String(selectedKTV)) ? slot : null;
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
  }, [selectedBranch?.id, selectedDate, selectedKTV, selectedServices, selectedTime]);

  const handlePrevWeek = () => setWeekStart((prev) => { const next = new Date(prev); next.setDate(next.getDate() - 7); return next; });
  const handleNextWeek = () => setWeekStart((prev) => { const next = new Date(prev); next.setDate(next.getDate() + 7); return next; });

  const getMonthYearLabel = () => {
    if (!daysList.length) return "";
    const midDay = new Date(weekStart);
    midDay.setDate(midDay.getDate() + 3);
    return `Tháng ${String(midDay.getMonth() + 1).padStart(2, "0")} - ${midDay.getFullYear()}`;
  };

  const handleConfirm = async () => {
    if (!selectedDate) {
      openSnackbar({ text: "Vui lòng chọn ngày hẹn", type: "error" });
      return;
    }
    if (isBookingDateTimeExpired(selectedDate, selectedTime)) {
      openSnackbar({ text: "Thời gian hẹn đã qua, vui lòng chọn ngày giờ khác.", type: "error" });
      return;
    }
    if (selectedServices.length === 0) {
      openSnackbar({ text: "Vui lòng chọn ít nhất 1 dịch vụ", type: "error" });
      return;
    }
    if (!selectedBranch) {
      openSnackbar({ text: "Vui lòng chọn cơ sở từ trang chủ", type: "error" });
      return;
    }

    if (selectedKTV) {
      setCheckingAvailability(true);
      try {
        const ids = await getBusyTechnicianIds({
          branchId: selectedBranch.id,
          scheduledStart: toLocalDateTimeString(selectedDate, selectedTime),
          serviceIds: selectedServices,
        });
        setBusyTechnicianIds(ids);
        if (ids.includes(String(selectedKTV))) {
          setSelectedKTV(undefined);
          openSnackbar({
            text: "Kỹ thuật viên đã có lịch trong khung giờ này. Vui lòng chọn kỹ thuật viên hoặc giờ khác.",
            type: "error",
          });
          return;
        }
      } finally {
        setCheckingAvailability(false);
      }
    }

    const matchedDate = daysList.find((d) => d.dateStr === selectedDate);
    const dateLabel = matchedDate ? `${matchedDate.dayLabel} (${matchedDate.displayDate})` : selectedDate;
    const technicianName = selectedKTV ? technicians.find(t => String(t.id) === String(selectedKTV))?.fullName || "" : "";
    const checkoutItems = selectedServices
      .map((id) => services.find(s => s.id === id))
      .filter(Boolean)
      .map((service) => ({
        id: service!.id,
        title: service!.title,
        price: service!.price,
        image: service!.image,
        branch: selectedBranch.name,
        branchId: selectedBranch.id,
        date: dateLabel,
        dateStr: selectedDate,
        time: selectedTime,
        quantity: guestCount,
        technicianId: selectedKTV || null,
        technicianName,
      }));

    setCheckout({ items: checkoutItems });
    navigate("/thanhtoan");
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const totalPrice = selectedServices.reduce((total, svcId) => {
    const srv = services.find(s => s.id === svcId);
    if (srv && srv.price) {
      const priceNum = parseInt(srv.price.replace(/[^\d]/g, ""));
      return total + (isNaN(priceNum) ? 0 : priceNum);
    }
    return total;
  }, 0);

  const formattedTotal = new Intl.NumberFormat("vi-VN").format(totalPrice) + "đ";

  return (
    <Page className="page" style={{ paddingBottom: 140, background: "#fdf2f8" }}>
      <Header title="Đặt lịch hẹn" showBackIcon={true}
        style={{ fontSize: 18, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }} />

      <Box p={4} style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "100vh" }}>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Số lượng người</label>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 12, border: "1px solid #fce7f3", padding: "6px", boxShadow: "0 2px 12px rgba(131, 24, 67, 0.02)", width: "100%", boxSizing: "border-box" }}>
            <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} style={{ width: 34, height: 34, borderRadius: "8px", border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", flex: 1, textAlign: "center" }}>{guestCount}</span>
            <button onClick={() => setGuestCount(guestCount + 1)} style={{ width: 34, height: 34, borderRadius: "8px", border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chi nhánh</label>
          <div style={{ padding: "14px 16px", background: "#fff", borderRadius: 12, border: "1px solid #fce7f3", fontSize: 14, fontWeight: 700, color: "#be185d" }}>
            {selectedBranch?.name || "Chưa chọn chi nhánh"}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, fontStyle: "italic" }}>* Để đổi chi nhánh, vui lòng chọn lại tại trang chủ</div>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn dịch vụ</label>
          <div
            onClick={() => setIsServiceSheetOpen(true)}
            style={{
              padding: "12px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff",
              color: selectedServices.length > 0 ? "#be185d" : "#9ca3af", fontWeight: 700, fontSize: 14,
              cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}
          >
            <span>
              {selectedServices.length > 0
                ? `Đã chọn ${selectedServices.length} dịch vụ`
                : "Nhấn để chọn dịch vụ"}
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          {selectedServices.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedServices.map(id => {
                const srv = services.find(s => s.id === id);
                if (!srv) return null;
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 12px", borderRadius: 12, border: "1px solid #fce7f3", boxShadow: "0 2px 8px rgba(131,24,67,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={srv.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.2, marginBottom: 2 }}>{srv.title}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#be185d" }}>{srv.price}</div>
                      </div>
                    </div>
                    <button onClick={() => toggleService(id)} style={{ border: "none", background: "#fdf2f8", color: "#be185d", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ order: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn kỹ thuật viên</label>
          <Select
            placeholder="Chọn kỹ thuật viên (tùy chọn)"
            value={selectedKTV || ""}
            onChange={(val) => setSelectedKTV((val as string) || undefined)}
            closeOnSelect={true}
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
          <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn ngày</label>
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
          <label style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginBottom: 8, display: "block" }}>Chọn giờ</label>
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
                const isBusyTime = selectedKTV ? busyTimeSlots.includes(slot) : false;
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
                    }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
</Box>

      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: "1px solid #fce7f3",
        padding: "16px",
        boxShadow: "0 -4px 12px rgba(131, 24, 67, 0.05)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4b5563" }}>Tạm tính ({selectedServices.length} dịch vụ):</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#be185d" }}>{formattedTotal}</span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={checkingAvailability}
          style={{
            width: "100%", height: 48, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800,
            boxShadow: "0 4px 12px rgba(190, 24, 93, 0.3)",
            cursor: checkingAvailability ? "wait" : "pointer",
            opacity: checkingAvailability ? 0.75 : 1,
          }}
        >
          {checkingAvailability ? "Đang kiểm tra..." : "Đặt lịch"}
        </button>
      </div>

      <Sheet
        visible={isServiceSheetOpen}
        onClose={() => setIsServiceSheetOpen(false)}
        title="Chọn dịch vụ"
        autoHeight
        mask
        handler
      >
        <div style={{ display: "flex", flexDirection: "column", height: "70vh", background: "#f9fafb" }}>
          <div style={{ padding: 16, background: "#fff", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{
              display: "flex", alignItems: "center", background: "#fdf2f8",
              borderRadius: 12, padding: "8px 12px", border: "1px solid #fbcfe8"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1f2937", width: "100%", fontWeight: 600 }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ border: "none", background: "transparent", color: "#9ca3af", cursor: "pointer", padding: "2px 4px", fontSize: 12 }}>×</button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {loadingServices ? (
              <div style={{ textAlign: "center", padding: 20, color: "#be185d", fontWeight: 700 }}>Đang tải...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredServices.map(item => {
                  const isSelected = selectedServices.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleService(item.id)}
                      style={{
                        background: "#fff", borderRadius: 16, overflow: "hidden",
                        border: isSelected ? "2px solid #be185d" : "1px solid #e5e7eb",
                        display: "flex", padding: 10, alignItems: "center", gap: 12,
                        cursor: "pointer", transition: "all 0.2s ease"
                      }}
                    >
                      <img src={item.image} alt={item.title} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: "#be185d", fontWeight: 800 }}>{item.price}</div>
                      </div>
                      <button
                        style={{
                          background: isSelected ? "#f3f4f6" : "#be185d",
                          color: isSelected ? "#4b5563" : "#fff",
                          border: "none", borderRadius: 8, padding: "6px 12px",
                          fontSize: 12, fontWeight: 700
                        }}
                      >
                        {isSelected ? "Bỏ chọn" : "Chọn"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ padding: 16, background: "#fff", borderTop: "1px solid #e5e7eb" }}>
            <button
              onClick={() => setIsServiceSheetOpen(false)}
              style={{
                width: "100%", height: 48, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800,
                boxShadow: "0 4px 12px rgba(190, 24, 93, 0.3)"
              }}
            >
              Hoàn tất chọn dịch vụ
            </button>
          </div>
        </div>
      </Sheet>

    </Page>
  );
};

export default DatlichPage;
