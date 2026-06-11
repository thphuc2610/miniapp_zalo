import React, { FC, useCallback, useEffect, useState } from "react";
import { Header, Modal, Page, Sheet, useSnackbar } from "zmp-ui";
import { useRecoilState, useSetRecoilState } from "recoil";
import { bookingHistoryState, quickBookingState, type BookingHistoryItem } from "state";
import { cancelSpaBooking, getSpaBookings, getSpaServices, submitSpaBookingFeedback } from "service/spaData";
import { buildAssetUrl } from "utils/common";
import fallbackServiceImage from "static/services/368174-tam-nhat-beauty-massage-goi-dau-duong-da-thong-kinh-lac.jpg";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const FALLBACK_IMAGE = fallbackServiceImage;

type BookingStatus = BookingHistoryItem["status"];

const DEFAULT_STATUS: BookingStatus = "Chờ xác nhận";
const BRAND_COLOR = "#be185d";

const STATUS_LABELS: Record<string, BookingStatus> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đã xác nhận",
  in_progress: "Đang phục vụ",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_LIST: Array<"Tất cả" | BookingStatus> = ["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đang phục vụ", "Đã hoàn thành", "Đã hủy"];

const STATUS_COLORS: Record<BookingStatus, string> = {
  "Chờ xác nhận": "#d97706",
  "Đã xác nhận": "#2563eb",
  "Đang phục vụ": "#8b5cf6",
  "Đã hoàn thành": "#10b981",
  "Đã hủy": "#dc2626",
};

const getStatusColor = (status: string) => STATUS_COLORS[status as BookingStatus] || BRAND_COLOR;

const StarRatingInput = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    {[1, 2, 3, 4, 5].map((star) => {
      const fillPercent = Math.max(0, Math.min(1, value / 2 - (star - 1))) * 100;
      return (
        <span key={star} style={{ position: "relative", width: 30, height: 30, display: "inline-block", color: "#d1d5db", fontSize: 30, lineHeight: "30px" }}>
          ★
          <span style={{ position: "absolute", inset: 0, width: `${fillPercent}%`, overflow: "hidden", color: "#f59e0b", pointerEvents: "none" }}>★</span>
          {[1, 2, 3, 4].map((part) => {
            const score = (star - 1) * 2 + part * 0.5;
            return (
              <button
                key={part}
                type="button"
                aria-label={`${score.toFixed(1)} điểm`}
                onClick={() => onChange(score)}
                style={{ position: "absolute", left: `${(part - 1) * 25}%`, top: 0, width: "25%", height: "100%", zIndex: 2, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
              />
            );
          })}
        </span>
      );
    })}
  </div>
);

const parseApiDate = (value?: string | null) => {
  if (!value) return null;
  const text = String(value).trim();
  const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(text) ? text : text.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatVietnamDateTime = (value?: string | null) => {
  const date = parseApiDate(value);
  if (!date) return "-";
  const time = date.toLocaleString("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
  const weekdayMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const weekday = weekdayMap[date.getDay()];
  const dateText = date.toLocaleDateString("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} - ${weekday}, ${dateText}`;
};

const getBookingDateParts = (value?: string | null) => {
  const date = parseApiDate(value);
  if (!date) return { dateStr: "", time: "" };
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return { dateStr: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
};

const formatPrice = (value?: number | string | null) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "-";
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

const formatFeedbackRating = (value?: number | string | null) => {
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating <= 0) return "";
  return (Math.round(Math.min(10, rating) * 2) / 2).toFixed(1);
};

const normalizeHalfRating = (value: number) => Math.max(0.5, Math.min(10, Math.round(value * 2) / 2));

export const OrderHistoryPage: FC = () => {
  const { openSnackbar } = useSnackbar();
  const setQuickBooking = useSetRecoilState(quickBookingState);
  const [history, setHistory] = useRecoilState(bookingHistoryState);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingHistoryItem | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<BookingHistoryItem | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(10);
  const [feedbackReview, setFeedbackReview] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [bookings, services] = await Promise.all([getSpaBookings(), getSpaServices()]);

      const mapped: BookingHistoryItem[] = (bookings || []).map((booking: any) => {
        const serviceIds = (booking.serviceIds || []).map((id: string) => String(id));
        const service = services.find((item) => serviceIds.includes(String(item.id)))
          || services.find((item) => String(booking.serviceNames || "").includes(item.title));
        const serviceId = service?.id || serviceIds[0] || booking.serviceId || booking.serviceIds?.[0] || booking.id;
        const status = STATUS_LABELS[booking.status] || DEFAULT_STATUS;
        const rating = booking.rating ?? booking.feedbackRating ?? null;
        const review = booking.review ?? booking.feedbackReview ?? booking.comment ?? null;
        const dateParts = getBookingDateParts(booking.scheduledStart);

        return {
          id: booking.id,
          serviceId,
          title: booking.serviceNames || "Dịch vụ Spa",
          price: formatPrice(booking.totalPrice),
          date: formatVietnamDateTime(booking.scheduledStart),
          scheduledStart: booking.scheduledStart,
          dateStr: dateParts.dateStr,
          time: dateParts.time,
          status,
          rawStatus: booking.status,
          branchId: booking.branchId,
          branch: booking.branchName || "Chi nhánh chính",
          branchAddress: booking.branchAddress || "",
          image: buildAssetUrl(service?.image) || FALLBACK_IMAGE,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          technicianId: booking.technicianId,
          technicianName: booking.technicianName,
          note: booking.note,
          rating,
          review,
          createdAt: booking.createdAt,
        };
      });

      setHistory(mapped.sort((a: any, b: any) => {
        const dateA = parseApiDate(a.createdAt)?.getTime() || 0;
        const dateB = parseApiDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      }));
    } catch (error) {
      console.error("Fetch bookings failed:", error);
    } finally {
      setLoading(false);
    }
  }, [setHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!selectedDetail) return;
    const latest = history.find((item: any) => item.id === selectedDetail.id);
    if (latest && (latest.rating !== selectedDetail.rating || latest.review !== selectedDetail.review)) {
      setSelectedDetail({ ...selectedDetail, ...latest });
    }
  }, [history, selectedDetail]);

  const handleRebook = (item: any) => {
    setQuickBooking({
      isOpen: true,
      item: {
        id: item.serviceId || item.id,
        title: item.title,
        price: item.price,
        image: item.image,
      },
      actionType: "buy",
      initialDateStr: item.dateStr,
      initialTime: item.time,
      initialTechnicianId: item.technicianId || null,
      initialBranch: item.branchId ? { id: item.branchId, name: item.branch } : null,
    });
  };

  const handleCancel = async (id: string) => {
    setCancelTarget(null);

    const previous = history;
    setCancellingId(id);
    setHistory((items) => items.map((item: any) => item.id === id ? { ...item, status: "Đã hủy", rawStatus: "cancelled" } : item));

    try {
      const res = await cancelSpaBooking(id);
      if (!res?.success) {
        setHistory(previous);
        openSnackbar({ text: res?.message || res?.error?.message || "Không thể hủy lịch hẹn.", type: "error" });
        return;
      }
      await loadHistory();
      openSnackbar({ text: "Đã hủy lịch hẹn.", type: "success" });
    } catch {
      setHistory(previous);
      openSnackbar({ text: "Không thể hủy lịch hẹn.", type: "error" });
    } finally {
      setCancellingId(null);
    }
  };

  const openFeedback = (item: BookingHistoryItem) => {
    setFeedbackTarget(item);
    setFeedbackRating(item.rating ? normalizeHalfRating(Number(item.rating)) : 10);
    setFeedbackReview(item.review || "");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTarget || submittingFeedback) return;
    setSubmittingFeedback(true);
    try {
      const review = feedbackReview.trim();
      const ratingScore = normalizeHalfRating(feedbackRating);
      const res = await submitSpaBookingFeedback(feedbackTarget.id, {
        rating: ratingScore,
        review: review || null,
      });
      if (!res?.success) {
        openSnackbar({ text: res?.message || res?.error?.message || "Không thể lưu đánh giá.", type: "error" });
        return;
      }
      setHistory((items) => items.map((item) => item.id === feedbackTarget.id ? { ...item, rating: ratingScore, review } : item));
      setSelectedDetail((item: any) => item?.id === feedbackTarget.id ? { ...item, rating: ratingScore, review } : item);
      setFeedbackTarget(null);
      setFeedbackReview("");
      await loadHistory();
      openSnackbar({ text: "Đã lưu đánh giá.", type: "success" });
    } catch {
      openSnackbar({ text: "Không thể lưu đánh giá.", type: "error" });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filtered = activeFilter === "Tất cả"
    ? history
    : history.filter((item: any) => item.status === activeFilter);

  return (
    <Page style={{ height: "100vh", background: "#fdf2f8", overflowY: "auto", overflowX: "hidden", paddingBottom: 80 }}>
      <Header
        title="Lịch sử đặt lịch"
        showBackIcon
        style={{ fontSize: 18, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }}
      />

      <div style={{ background: "#fff", borderBottom: "1px solid #fce7f3", display: "flex", overflowX: "auto", padding: "12px 16px", gap: 8, scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        {STATUS_LIST.map((status) => {
          const isSelected = activeFilter === status;
          const statusColor = status === "Tất cả" ? BRAND_COLOR : getStatusColor(status);
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              style={{
                border: `1px solid ${isSelected ? statusColor : BRAND_COLOR}`,
                background: isSelected ? statusColor : "#fff",
                color: isSelected ? "#fff" : BRAND_COLOR,
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {status}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px 12px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#be185d", fontWeight: 800 }}>Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>Không tìm thấy lịch sử đặt lịch.</p>
          </div>
        ) : (
          filtered.map((order: any) => {
            const canCancel = order.rawStatus === "pending" || order.rawStatus === "confirmed" || order.status === "Chờ xác nhận" || order.status === "Đã xác nhận";
            const statusColor = getStatusColor(order.status);
            const hasFeedback = Boolean(order.rating || order.review);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedDetail(order)}
                style={{ background: "#fff", borderRadius: 8, padding: 10, display: "flex", gap: 12, boxShadow: "0 4px 16px rgba(131,24,67,0.02)", border: "1px solid #fce7f3", alignItems: "center", cursor: "pointer" }}
              >
                <img src={order.image} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "#f3f4f6" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "#1f2937", lineHeight: 1.3, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>{order.title}</h3>
                    <div title={order.status} style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, boxShadow: `0 0 6px ${statusColor}70`, flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{order.branch}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{order.date}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <strong style={{ fontSize: 13, color: "#be185d", fontWeight: 800 }}>{order.price}</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                      {canCancel && (
                        <button
                          disabled={cancellingId === order.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setCancelTarget(order);
                          }}
                          style={{ border: "1px solid #d1d5db", background: "#fff", color: "#4b5563", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: cancellingId === order.id ? "wait" : "pointer", opacity: cancellingId === order.id ? 0.65 : 1 }}
                        >
                          {cancellingId === order.id ? "Đang hủy..." : "Hủy lịch"}
                        </button>
                      )}
                      {(order.status === "Đã hoàn thành" || order.status === "Đã hủy") && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRebook(order);
                          }}
                          style={{ border: "1px solid #be185d", background: "#fff", color: "#be185d", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                        >
                          Đặt lại
                        </button>
                      )}
                      {order.status === "Đã hoàn thành" && (
                        hasFeedback ? (
                          <button
                            disabled
                            style={{ border: "1px solid #d1d5db", background: "#f9fafb", color: "#6b7280", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "not-allowed" }}
                          >
                            Đã đánh giá
                          </button>
                        ) : (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openFeedback(order);
                            }}
                            style={{ border: "1px solid #f59e0b", background: "#fffbeb", color: "#b45309", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                          >
                            Đánh giá
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Sheet visible={Boolean(selectedDetail)} onClose={() => setSelectedDetail(null)} autoHeight handler>
        {selectedDetail ? (() => {
          const detail = history.find((item: any) => item.id === selectedDetail.id) || selectedDetail;
          return (
          <div style={{ padding: "20px 18px 28px", background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#831843", marginBottom: 16 }}>Chi tiết lịch hẹn</div>
            {[
              ["Dịch vụ", detail.title],
              ["Kỹ thuật viên", detail.technicianName || "Chưa gán"],
              ["Thời gian hẹn", detail.date],
              ["Tên khách hàng", detail.customerName || "-"],
              ["Số điện thoại", detail.customerPhone || "-"],
              ["Trạng thái", detail.status],
              ["Chi nhánh", detail.branchAddress ? `${detail.branch} - ${detail.branchAddress}` : detail.branch],
              ["Ghi chú", detail.note || ""],
              ["Đánh giá", formatFeedbackRating(detail.rating)],
              ["Nhận xét", detail.review || ""],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "118px 1fr", alignItems: "start", gap: 12, padding: "10px 0", borderBottom: "1px solid #fce7f3" }}>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 700, whiteSpace: "nowrap", textAlign: "left" }}>{label}</span>
                <span style={{ fontSize: 13, color: "#1f2937", fontWeight: 700, textAlign: "left", lineHeight: 1.45, wordBreak: "break-word" }}>{value}</span>
              </div>
            ))}
          </div>
          );
        })() : null}
      </Sheet>

      <Modal
        visible={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title=""
        modalStyle={{ borderRadius: 16, padding: "22px 18px 18px", background: "#fff", width: "calc(100vw - 48px)", maxWidth: 340 }}
      >
        {cancelTarget ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24, fontWeight: 800 }}>
              !
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#831843", marginBottom: 8 }}>Hủy lịch hẹn?</div>
            <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.45, marginBottom: 18 }}>
              Bạn chắc chắn muốn hủy lịch này?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setCancelTarget(null)}
                style={{ flex: 1, height: 44, borderRadius: 10, border: "1px solid #fbcfe8", background: "#fff", color: "#831843", fontSize: 14, fontWeight: 800 }}
              >
                Giữ lịch
              </button>
              <button
                disabled={cancellingId === cancelTarget.id}
                onClick={() => handleCancel(cancelTarget.id)}
                style={{ flex: 1, height: 44, borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontSize: 14, fontWeight: 800, opacity: cancellingId === cancelTarget.id ? 0.65 : 1, boxShadow: "0 8px 18px rgba(220,38,38,0.2)" }}
              >
                {cancellingId === cancelTarget.id ? "Đang hủy..." : "Hủy lịch"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        visible={Boolean(feedbackTarget)}
        onClose={() => setFeedbackTarget(null)}
        title=""
        modalStyle={{ borderRadius: 16,  background: "#fff", width: "calc(100vw - 40px)", maxWidth: 360 }}
      >
        {feedbackTarget ? (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#831843", marginBottom: 14 }}>Đánh giá lịch hẹn</div>
            <div style={{ display: "flex", gap: 12, padding: 10, border: "1px solid #fce7f3", borderRadius: 14, background: "#fdf2f8", marginBottom: 16 }}>
              <img src={feedbackTarget.image || FALLBACK_IMAGE} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", background: "#f3f4f6", flexShrink: 0 }} />
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1f2937", lineHeight: 1.35, textAlign: "left" }}>{feedbackTarget.title}</div>
                <div style={{ fontSize: 12, color: "#be185d", fontWeight: 800, textAlign: "left" }}>{feedbackTarget.price || ""}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 800, marginBottom: 8 }}>Đánh giá</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
              <StarRatingInput value={feedbackRating} onChange={setFeedbackRating} />
              <span style={{ fontSize: 12, color: "#b45309", fontWeight: 800, whiteSpace: "nowrap" }}>
                {feedbackRating.toFixed(1)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 800, marginBottom: 8 }}>Nhận xét</div>
            <textarea
              value={feedbackReview}
              onChange={(event) => setFeedbackReview(event.target.value)}
              placeholder="Nhập nhận xét của bạn..."
              rows={4}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #fbcfe8", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 600, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setFeedbackTarget(null)}
                style={{ flex: 1, height: 44, borderRadius: 10, border: "1px solid #fbcfe8", background: "#fff", color: "#831843", fontSize: 14, fontWeight: 800 }}
              >
                Đóng
              </button>
              <button
                disabled={submittingFeedback}
                onClick={handleSubmitFeedback}
                style={{ flex: 1, height: 44, borderRadius: 10, border: "none", background: "#be185d", color: "#fff", fontSize: 14, fontWeight: 800, opacity: submittingFeedback ? 0.65 : 1, boxShadow: "0 8px 18px rgba(190,24,93,0.2)" }}
              >
                {submittingFeedback ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </Page>
  );
};

export default OrderHistoryPage;
