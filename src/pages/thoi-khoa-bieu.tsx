import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header, Page, Box, Text, Icon, Spinner, useSnackbar } from "zmp-ui";
import { StatusPill } from "components/common";
import { getSpaBookings, getSpaServices, SpaBooking, SpaService } from "service/spaData";

const BOOKING_REFRESH_INTERVAL_MS = 30000;
const VIETNAMESE_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const SHORT_DAYS_BY_JS_DAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getStartOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - (day === 0 ? 6 : day - 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDatesOfWeek = (weekOffset: number) => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const startOfWeek = getStartOfWeek(baseDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return {
      label: VIETNAMESE_DAYS[index],
      date: formatDateKey(date),
      fullDate: date,
    };
  });
};

const getMonthYearLabel = (weekDates: { fullDate: Date }[]) => {
  const midDay = weekDates[3]?.fullDate;
  if (!midDay) return "";
  return `Tháng ${String(midDay.getMonth() + 1).padStart(2, "0")} - ${midDay.getFullYear()}`;
};

const getBookingDate = (scheduledStart?: string | null) => {
  if (!scheduledStart) return null;
  const date = new Date(scheduledStart);
  if (!Number.isNaN(date.getTime())) return date;

  const datePart = String(scheduledStart).split("T")[0];
  const fallback = new Date(`${datePart}T00:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const getBookingDateKey = (scheduledStart?: string | null) => String(scheduledStart || "").split("T")[0];

const formatTime = (date?: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const formatBookingDate = (scheduledStart?: string | null) => {
  const date = getBookingDate(scheduledStart);
  if (!date) return "Chưa có ngày";
  return `${SHORT_DAYS_BY_JS_DAY[date.getDay()]} ${date.toLocaleDateString("vi-VN")}`;
};

const parseDurationMinutes = (duration?: string) => {
  if (!duration) return 0;
  const hours = duration.match(/(\d+(?:[.,]\d+)?)\s*(?:giờ|gio|h)/i);
  const minutes = duration.match(/(\d+)\s*(?:phút|phut|p)/i);
  const hourMinutes = hours ? Math.round(Number(hours[1].replace(",", ".")) * 60) : 0;
  const minuteValue = minutes ? Number(minutes[1]) : 0;
  if (hourMinutes || minuteValue) return hourMinutes + minuteValue;

  const number = duration.match(/\d+/);
  return number ? Number(number[0]) : 0;
};

const getTimeRange = (booking: SpaBooking, services: SpaService[]) => {
  const start = getBookingDate(booking.scheduledStart);
  if (!start) return "--:--";

  const explicitDuration = Number(booking.durationMinutes || booking.totalDurationMinutes || 0);
  const serviceDuration = services.reduce((sum, service) => sum + parseDurationMinutes(service.duration), 0);
  const totalMinutes = explicitDuration || serviceDuration;

  if (!totalMinutes) return formatTime(start);
  const end = new Date(start.getTime() + totalMinutes * 60 * 1000);
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const splitTextList = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

const getBookingId = (booking: SpaBooking) => String(booking?.id || "");

const getBookingServices = (booking: SpaBooking, serviceLookup: Map<string, SpaService>) => {
  const serviceIds = splitTextList(booking.serviceIds);
  const services = serviceIds.map((id) => serviceLookup.get(id)).filter(Boolean) as SpaService[];
  if (services.length) return services;

  const names = splitTextList(booking.serviceNames);
  return names.map((name, index) => ({
    id: `${booking.id || "booking"}-${index}`,
    title: name,
    price: "",
    image: "",
    group: "",
    description: "",
    benefits: [],
    steps: [],
  }));
};

const getStatusColor = (status?: string | null) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "#f59e0b";
    case "confirmed":
      return "#10b981";
    case "in_progress":
      return "#3b82f6";
    case "completed":
      return "#8b5cf6";
    case "cancelled":
      return "#ef4444";
    default:
      return "#be185d";
  }
};

const getStatusLabel = (status?: string | null) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "in_progress":
      return "Đang phục vụ";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status || "Lịch hẹn";
  }
};

export const TechnicianSchedulePage: FC = () => {
  const { openSnackbar } = useSnackbar();
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedBookingsRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<SpaBooking[]>([]);
  const [services, setServices] = useState<SpaService[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  const weekDates = useMemo(() => getDatesOfWeek(weekOffset), [weekOffset]);
  const monthYearLabel = useMemo(() => getMonthYearLabel(weekDates), [weekDates]);
  const serviceLookup = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);

  const updateBookings = useCallback((nextBookings: SpaBooking[], notifyNewBookings: boolean) => {
    const nextIds = new Set(nextBookings.map(getBookingId).filter(Boolean));

    if (notifyNewBookings && hasLoadedBookingsRef.current) {
      const newBookingsCount = nextBookings.filter((booking) => {
        const id = getBookingId(booking);
        return id && !knownBookingIdsRef.current.has(id);
      }).length;

      if (newBookingsCount > 0) {
        openSnackbar({
          text: newBookingsCount === 1 ? "Có lịch hẹn mới." : `Có ${newBookingsCount} lịch hẹn mới.`,
          type: "success",
        });
      }
    }

    knownBookingIdsRef.current = nextIds;
    hasLoadedBookingsRef.current = true;
    setBookings(nextBookings);
  }, [openSnackbar]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getSpaBookings(), getSpaServices()])
      .then(([bookingData, serviceData]) => {
        if (!mounted) return;
        updateBookings(bookingData || [], false);
        setServices(serviceData || []);
      })
      .catch(() => {
        if (mounted) {
          updateBookings([], false);
          setServices([]);
        }
      })
      .then(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [updateBookings]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const bookingData = await getSpaBookings();
        updateBookings(bookingData || [], true);
      } catch {
        // Giữ im lặng để không làm phiền KTV khi mạng chập chờn.
      }
    }, BOOKING_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [updateBookings]);

  useEffect(() => {
    if (!weekDates.some((day) => day.date === selectedDate)) {
      setSelectedDate(weekDates[0]?.date || formatDateKey(new Date()));
    }
  }, [selectedDate, weekDates]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => getBookingDateKey(booking.scheduledStart) === selectedDate)
      .sort((a, b) => String(a.scheduledStart || "").localeCompare(String(b.scheduledStart || "")));
  }, [bookings, selectedDate]);

  return (
    <Page className="page-shell" style={{ background: "#fdf2f8", minHeight: "100vh" }}>
      <Header
        title="Thời khóa biểu của tôi"
        style={{ background: "var(--color-2)", textAlign: "center", }}
      />

      <Box style={{ background: "#fdf2f8", borderBottom: "1px solid #fce7f3", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #fce7f3", padding: "12px 10px", boxShadow: "0 2px 12px rgba(131, 24, 67, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
            <button type="button" onClick={() => setWeekOffset((value) => value - 1)} aria-label="Tuần trước" style={{ border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#831843", textTransform: "uppercase", letterSpacing: 0.5 }}>{monthYearLabel}</div>
            <button type="button" onClick={() => setWeekOffset((value) => value + 1)} aria-label="Tuần sau" style={{ border: "none", background: "#fdf2f8", color: "#be185d", cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
            {weekDates.map((day) => {
              const isSelected = selectedDate === day.date;
              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 0",
                    borderRadius: 12,
                    cursor: "pointer",
                    background: isSelected ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : "transparent",
                    color: isSelected ? "#fff" : "#be185d",
                    border: "1px solid transparent",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{day.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{day.fullDate.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Box>

      <Box p={4}>
        {loading ? (
          <Box flex justifyContent="center" alignItems="center" style={{ height: "50vh" }}>
            <Spinner />
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Box flex flexDirection="column" alignItems="center" justifyContent="center" style={{ height: "50vh", opacity: 0.5 }}>
            <Text style={{ marginTop: 12, fontWeight: 600 }}>Không có lịch hẹn trong ngày này</Text>
          </Box>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredBookings.map((booking) => {
              const bookingServices = getBookingServices(booking, serviceLookup);
              const contactText = [booking.customerPhone, booking.customerEmail].filter(Boolean).join(" - ");
              const noteText = String(booking.note || "").trim();

              return (
                <Box
                  key={booking.id}
                  style={{ padding: 12, background: "#fff", border: "1px solid #fce7f3", borderRadius: 16, boxShadow: "0 6px 18px rgba(131,24,67,.06)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {bookingServices.map((service) => (
                        <div key={service.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <img src={service.image} alt={service.title} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />

                          <div style={{ flex: 1 }}>
                            <div style={{ color: "#831843", fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, wordBreak: "break-word" }}>{service.title}</div>
                            {service.duration && (<div style={{ marginTop: 2, color: "#64748b", fontSize: 11.5, fontWeight: 700 }}>{service.duration}</div>)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center", color: "#475569", fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "#be185d", fontSize: 13, fontWeight: 700 }}>
                        <Icon icon="zi-user" size={14} />
                      </div>

                      <div style={{ wordBreak: "break-word" }}>
                        <span style={{ color: "#111827", fontWeight: 700 }}>{booking.customerName || "Khách hàng"}</span>
                        {contactText && (<span style={{ color: "#64748b" }}> · {contactText}</span> )}
                      </div>
                    </div>

                    {noteText && (
                      <div style={{ padding: "7px 9px", color: "#9a3412", background: "#fff7ed", borderRadius: 10, fontSize: 12.5, lineHeight: 1.45 }}>
                        <span style={{ fontWeight: 700 }}>Ghi chú: </span>
                        {noteText}
                      </div>
                    )}

                    <div
                      style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div
                        style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "#be185d", fontSize: 13, fontWeight: 700 }}>
                        <Icon icon="zi-clock-1" size={15} />
                        <span style={{ color: "#64748b", fontSize: 12 }}> {getTimeRange(booking, bookingServices)} ·{" "}
                          {formatBookingDate(booking.scheduledStart)}
                        </span>
                      </div>

                      <StatusPill
                        dot
                        style={{
                          color: getStatusColor(booking.status),
                          borderColor: "#e2e8f0",
                        }}
                      >
                        {getStatusLabel(booking.status)}
                      </StatusPill>
                    </div>
                  </div>
                </Box>
              );
            })}
          </div>
        )}
      </Box>
    </Page>
  );
};

export default TechnicianSchedulePage;
