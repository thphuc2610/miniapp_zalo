import React, { FC, useEffect, useState } from "react";
import { Header, Page, useSnackbar, Sheet, Icon } from "zmp-ui";
import { getSpaReviews, createSpaReview, getSpaServices, getSpaTechnicians, deleteSpaReview, getCustomerProfile } from "service/spaData";
import { useAuthCheck } from "hooks/useAuthCheck";
import { buildAssetUrl } from "utils/common";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const reviewTargets = [
  { value: "service", label: "Đánh giá dịch vụ", icon: "zi-star" },
  { value: "technician", label: "Đánh giá kỹ thuật viên", icon: "zi-user" },
  { value: "general", label: "Góp ý chung", icon: "zi-chat" },
];

const text = {
  pageTitle: "Đánh giá",
  reviewCount: "đánh giá",
  customerShared: "Khách hàng chia sẻ",
  loadingReviews: "Đang tải đánh giá...",
  emptyReviews: "Chưa có đánh giá nào.",
  generalFeedback: "Góp ý chung",
  shareExperience: "Chia sẻ trải nghiệm của bạn",
  qualityLabel: "Đánh giá chất lượng:",
  namePlaceholder: "Tên của bạn",
  targetPlaceholder: "Chọn nội dung đánh giá",
  servicePlaceholder: "Chọn dịch vụ cụ thể",
  technicianPlaceholder: "Chọn kỹ thuật viên cụ thể",
  commentPlaceholder: "Viết cảm nhận hoặc góp ý của bạn...",
  submitting: "Đang gửi...",
  submit: "Gửi đánh giá",
};

const STAR_COLOR = "#eab308";
const starPath = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

const selectStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: "1px solid #fbcfe8",
  padding: "0 36px 0 12px",
  fontSize: 13,
  fontWeight: 800,
  color: "#374151",
  background: "linear-gradient(180deg, #fff 0%, #fdf2f8 100%)",
  outline: "none",
  boxShadow: "0 4px 12px rgba(190, 24, 93, 0.06)",
  appearance: "none",
};

const selectWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
};



const parseReviewCreatedAt = (value?: string | null) => {
  if (!value) return null;
  const text = String(value).trim();
  let normalized = text.replace(" ", "T");
  if (normalized.endsWith("Z")) {
    normalized = normalized.slice(0, -1);
  }
  let date = dayjs(normalized);
  if (date.isValid()) {
    const now = dayjs();
    if (date.isAfter(now)) {
      if (date.diff(now, 'hour') >= 5) {
        date = date.subtract(7, 'hour');
      } else {
        date = now;
      }
    }
    return date;
  }
  return null;
};

const formatReviewCreatedAt = (value?: string | null) => parseReviewCreatedAt(value)?.fromNow() || "";
const normalizeHalfRating = (value: number) => Math.max(0.5, Math.min(10, Math.round(value * 2) / 2));



function StarMeter({
  value,
  size = 14,
  gap = 2,
  interactive = false,
  onSelect,
}: {
  value: number;
  size?: number;
  gap?: number;
  interactive?: boolean;
  onSelect?: (value: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(1, value / 2 - (star - 1))) * 100;
        return (
          <span key={star} style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={STAR_COLOR} strokeWidth="2" style={{ display: "block" }}>
              <polygon points={starPath} />
            </svg>
            <span style={{ position: "absolute", inset: 0, width: `${fillPercent}%`, overflow: "hidden", pointerEvents: "none" }}>
              <svg width={size} height={size} viewBox="0 0 24 24" fill={STAR_COLOR} stroke={STAR_COLOR} strokeWidth="2" style={{ display: "block", minWidth: size }}>
                <polygon points={starPath} />
              </svg>
            </span>
            {interactive ? (
              <>
                {[1, 2, 3, 4].map((part) => {
                  const score = (star - 1) * 2 + part * 0.5;
                  return (
                    <button
                      key={part}
                      type="button"
                      aria-label={`${score.toFixed(1)} điểm`}
                      onClick={() => onSelect?.(score)}
                      style={{ position: "absolute", left: `${(part - 1) * 25}%`, top: 0, width: "25%", height: "100%", zIndex: 2, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    />
                  );
                })}
              </>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export const ClientReviewsPage: FC = () => {
  const { openSnackbar } = useSnackbar();
  const { checkAuth } = useAuthCheck();

  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(10);
  const [commentText, setCommentText] = useState("");
  const [name, setName] = useState("");
  const [customerAvatar, setCustomerAvatar] = useState("");
  const [reviewTarget, setReviewTarget] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [selectedTechnicianName, setSelectedTechnicianName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isTargetSheetOpen, setIsTargetSheetOpen] = useState(false);
  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [isTechnicianSheetOpen, setIsTechnicianSheetOpen] = useState(false);
  const [searchService, setSearchService] = useState("");
  const [searchTechnician, setSearchTechnician] = useState("");
  const [showPending, setShowPending] = useState(false);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await getSpaReviews();
      setReviewsList(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
    Promise.all([getSpaServices(), getSpaTechnicians()]).then(([serviceItems, technicianItems]) => {
      setServices(serviceItems || []);
      setTechnicians(technicianItems || []);
    });
    getCustomerProfile().then((profile) => {
      if (profile?.fullName) setName(profile.fullName);
      if (profile?.avatarUrl) setCustomerAvatar(profile.avatarUrl);
    });
  }, []);

  useEffect(() => {
    setSelectedServiceName("");
    setSelectedTechnicianName("");
  }, [reviewTarget]);

  const submitReview = async () => {
    if (!name.trim()) {
      openSnackbar({ text: "Vui lòng nhập tên của bạn", type: "error" });
      return;
    }
    if (!reviewTarget) {
      openSnackbar({ text: "Vui lòng chọn nội dung muốn đánh giá", type: "error" });
      return;
    }
    if (!commentText.trim()) {
      openSnackbar({ text: "Vui lòng nhập nội dung đánh giá", type: "error" });
      return;
    }
    if (reviewTarget === "service" && !selectedServiceName) {
      openSnackbar({ text: "Vui lòng chọn dịch vụ cần đánh giá", type: "error" });
      return;
    }
    if (reviewTarget === "technician" && !selectedTechnicianName) {
      openSnackbar({ text: "Vui lòng chọn kỹ thuật viên cần đánh giá", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const targetName =
        reviewTarget === "service"
          ? selectedServiceName
          : reviewTarget === "technician"
            ? selectedTechnicianName
            : text.generalFeedback;
      const res = await createSpaReview({
        customerName: name.trim(),
        customerAvatar: customerAvatar || null,
        serviceName: targetName,
        rating: normalizeHalfRating(rating),
        content: commentText.trim(),
        status: "pending",
      });

      if (res.success) {
        openSnackbar({ text: "Cảm ơn bạn đã gửi đánh giá. Đánh giá sẽ hiển thị sau khi được duyệt.", type: "success" });
        setCommentText("");
        setRating(10);
        setReviewTarget("");
        setSelectedServiceName("");
        setSelectedTechnicianName("");
        void loadReviews();
      } else {
        openSnackbar({ text: "Không thể gửi đánh giá. Vui lòng đăng nhập lại và thử lại.", type: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    checkAuth(() => {
      void submitReview();
    }, {
      icon: "profile",
      title: "Đăng nhập để gửi đánh giá",
      reason: "Vui lòng đăng nhập khi muốn gửi đánh giá mới.",
      redirectTo: "/danhgia",
    });
  };

  const handleDeleteReview = async (id: string | number) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      const success = await deleteSpaReview(id);
      if (success) {
        openSnackbar({ text: "Đã xóa đánh giá.", type: "success" });
        void loadReviews();
      } else {
        openSnackbar({ text: "Xóa đánh giá thất bại.", type: "error" });
      }
    }
  };

  const publicReviews = reviewsList.filter((r) => r.status !== "pending" && r.status !== "rejected");
  const stats = {
    avg: publicReviews.length > 0 ? (publicReviews.reduce((acc, item) => acc + Number(item.rating || 0), 0) / publicReviews.length).toFixed(1) : "5.0",
    count: publicReviews.length,
  };

  return (
    <Page style={{ height: "100vh", background: "#fdf2f8", overflowY: "auto", paddingBottom: 80, overflowX: "hidden" }}>
      <Header title={text.pageTitle} showBackIcon={true}
        style={{ fontSize: 18, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }}
      />

      <div style={{ padding: "16px 6px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 18, border: "1px solid #fce7f3", boxShadow: "0 4px 16px rgba(131,24,67,0.02)", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center", borderRight: "1px solid #f3f4f6", paddingRight: 18 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#be185d" }}>{stats.avg}</div>
            <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
              <StarMeter value={parseFloat(stats.avg)} size={12} />
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 800 }}>{stats.count} {text.reviewCount}</div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = publicReviews.filter((item) => Math.round(Number(item.rating || 0) / 2) === star).length;
              const percent = publicReviews.length > 0 ? `${((count / publicReviews.length) * 100).toFixed(0)}%` : "0%";
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#6b7280", fontWeight: 800 }}>
                  <span style={{ width: 34 }}>{star} sao</span>
                  <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: percent, height: "100%", background: STAR_COLOR, borderRadius: 99 }} />
                  </div>
                  <span style={{ width: 26, textAlign: "right" }}>{percent}</span>
                </div>
              );
            })}
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", marginTop: 24 }}>{text.customerShared}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "#9ca3af" }}>{text.loadingReviews}</div>
          ) : reviewsList.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#9ca3af" }}>{text.emptyReviews}</div>
          ) : (
            <>
              {publicReviews.map((review) => (
                <div key={review.id} style={{ background: "#fff", borderRadius: 20, padding: 14, border: "1px solid #fce7f3", boxShadow: "0 4px 16px rgba(131,24,67,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {review.customerAvatar ? (
                          <img src={review.customerAvatar} alt={review.customerName || text.generalFeedback} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                        ) : <Icon icon="zi-user" style={{ color: "#be185d", fontSize: 20 }} />}
                      </div>
                      <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                        <strong style={{ fontSize: 13, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{review.customerName}</strong>
                        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
                          {review.serviceName || text.generalFeedback}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                      <StarMeter value={Number(review.rating || 0)} size={10} />
                      <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>{formatReviewCreatedAt(review.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, textAlign: "left", marginBottom: 0 }}>{review.content || review.comment}</p>
                </div>
              ))}

              {reviewsList.filter(r => r.status === "pending" && r.customerName === name).length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", margin: "16px 0 8px", width: "100%" }}>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    <span style={{ padding: "4px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, margin: "0 8px", display: "flex", alignItems: "center" }}>
                      Đang chờ duyệt
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  </div>
                  
                  {reviewsList.filter(r => r.status === "pending" && r.customerName === name).map((review) => (
                    <div key={review.id} style={{ background: "#f9fafb", borderRadius: 12, padding: 14, border: "1px dashed #e5e7eb", opacity: 0.9 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                            {review.customerAvatar ? (
                              <img src={review.customerAvatar} alt={review.customerName || text.generalFeedback} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }} />
                            ) : <Icon icon="zi-user" style={{ color: "#9ca3af", fontSize: 20 }} />}
                          </div>
                          <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                            <strong style={{ fontSize: 13, color: "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{review.customerName}</strong>
                            <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
                              {review.serviceName || text.generalFeedback}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, filter: "grayscale(100%)" }}>
                          <StarMeter value={Number(review.rating || 0)} size={10} />
                          <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>{formatReviewCreatedAt(review.createdAt)}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, textAlign: "left", marginBottom: 8 }}>{review.content || review.comment}</p>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => handleDeleteReview(review.id!)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon icon="zi-delete" size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", marginTop: 24 }}>{text.shareExperience}</h3>
        <div style={{ background: "#fff", borderRadius: 20, padding: 18, border: "1px solid #fce7f3", boxShadow: "0 4px 16px rgba(131,24,67,0.02)", marginTop: 18 }}>
          <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#4b5563", fontWeight: 800 }}>{text.qualityLabel}</span>
              <StarMeter value={rating} size={22} gap={6} interactive onSelect={setRating} />
              <span style={{ fontSize: 12, color: "#be185d", fontWeight: 800 }}>{rating.toFixed(1)} điểm</span>
            </div>
            <input type="text" placeholder={text.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid #fce7f3", padding: "0 12px", fontSize: 13, fontWeight: 700, background: "#fdf2f8", outline: "none" }} />
            <div
              role="button"
              onClick={() => setIsTargetSheetOpen(true)}
              style={{
                width: "100%",
                minHeight: 46,
                borderRadius: 12,
                border: "1px solid rgba(190, 24, 93, 0.18)",
                padding: "0 12px",
                background: "linear-gradient(180deg, #fff 0%, #fdf2f8 100%)",
                boxShadow: "var(--shadow-chip)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                color: reviewTarget ? "#374151" : "#9ca3af",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, pointerEvents: "none" }}>
                <Icon icon={(reviewTargets.find((item) => item.value === reviewTarget)?.icon || "zi-list-1") as any} size={18} style={{ color: "#be185d", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {reviewTargets.find((item) => item.value === reviewTarget)?.label || text.targetPlaceholder}
                </span>
              </span>
              <div style={{ pointerEvents: "none" }}><Icon icon="zi-chevron-down" size={16} style={{ color: "#be185d", flexShrink: 0 }} /></div>
            </div>
            {reviewTarget === "service" && (
              <div
                role="button"
                onClick={() => setIsServiceSheetOpen(true)}
                style={{
                  width: "100%", minHeight: 46, borderRadius: 12, border: "1px solid rgba(190, 24, 93, 0.18)",
                  padding: "0 12px", background: "linear-gradient(180deg, #fff 0%, #fdf2f8 100%)",
                  boxShadow: "var(--shadow-chip)", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, color: selectedServiceName ? "#374151" : "#9ca3af", fontSize: 13, fontWeight: 800, cursor: "pointer"
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedServiceName || text.servicePlaceholder}
                </span>
                <div style={{ pointerEvents: "none" }}><Icon icon="zi-chevron-down" size={16} style={{ color: "#be185d", flexShrink: 0 }} /></div>
              </div>
            )}
            {reviewTarget === "technician" && (
              <div
                role="button"
                onClick={() => setIsTechnicianSheetOpen(true)}
                style={{
                  width: "100%", minHeight: 46, borderRadius: 12, border: "1px solid rgba(190, 24, 93, 0.18)",
                  padding: "0 12px", background: "linear-gradient(180deg, #fff 0%, #fdf2f8 100%)",
                  boxShadow: "var(--shadow-chip)", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, color: selectedTechnicianName ? "#374151" : "#9ca3af", fontSize: 13, fontWeight: 800, cursor: "pointer"
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedTechnicianName || text.technicianPlaceholder}
                </span>
                <div style={{ pointerEvents: "none" }}><Icon icon="zi-chevron-down" size={16} style={{ color: "#be185d", flexShrink: 0 }} /></div>
              </div>
            )}
            <textarea placeholder={text.commentPlaceholder} rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ width: "100%", borderRadius: 10, border: "1px solid #fce7f3", padding: "10px 12px", fontSize: 13, fontWeight: 600, background: "#fdf2f8", outline: "none", resize: "none" }} />
            <button type="submit" disabled={submitting} style={{ width: "100%", height: 42, borderRadius: 12, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 10px rgba(190, 24, 93, 0.2)", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? text.submitting : text.submit}
            </button>
          </form>
        </div>
      </div>
      <Sheet visible={isTargetSheetOpen} onClose={() => setIsTargetSheetOpen(false)} autoHeight mask handler>
        <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 8 }}>{text.targetPlaceholder}</h3>
          {reviewTargets.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => { setReviewTarget(item.value); setIsTargetSheetOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                background: reviewTarget === item.value ? "#fdf2f8" : "#fff",
                border: reviewTarget === item.value ? "1px solid #be185d" : "1px solid #e5e7eb",
                color: reviewTarget === item.value ? "#be185d" : "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}
            >
              <Icon icon={item.icon as any} size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet visible={isServiceSheetOpen} onClose={() => setIsServiceSheetOpen(false)} mask handler>
        <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12, height: "60vh", overflowY: "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 8, flexShrink: 0 }}>{text.servicePlaceholder}</h3>
          <div style={{ flexShrink: 0, marginBottom: 4 }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm dịch vụ..." 
              value={searchService} 
              onChange={(e) => setSearchService(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #fce7f3", outline: "none", background: "#fdf2f8", fontSize: 14 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
            {services.filter(s => !searchService || s.title.toLowerCase().includes(searchService.toLowerCase())).map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => { setSelectedServiceName(service.title); setIsServiceSheetOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 12,
                  background: selectedServiceName === service.title ? "#fdf2f8" : "#fff",
                  border: selectedServiceName === service.title ? "1px solid #be185d" : "1px solid #e5e7eb",
                  color: selectedServiceName === service.title ? "#be185d" : "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={service.image} alt={service.title} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", background: "#f3f4f6", flexShrink: 0 }} />
                  <span>{service.title}</span>
                </div>
                {selectedServiceName === service.title && <Icon icon="zi-check" size={20} style={{ color: "#be185d", flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
      <Sheet visible={isTechnicianSheetOpen} onClose={() => setIsTechnicianSheetOpen(false)} mask handler>
        <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12, height: "60vh", overflowY: "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 8, flexShrink: 0 }}>{text.technicianPlaceholder}</h3>
          <div style={{ flexShrink: 0, marginBottom: 4 }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm kỹ thuật viên..." 
              value={searchTechnician} 
              onChange={(e) => setSearchTechnician(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #fce7f3", outline: "none", background: "#fdf2f8", fontSize: 14 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
            {technicians.filter(t => !searchTechnician || t.fullName.toLowerCase().includes(searchTechnician.toLowerCase())).map((technician) => (
              <button
                key={technician.id}
                type="button"
                onClick={() => { setSelectedTechnicianName(technician.fullName); setIsTechnicianSheetOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 12,
                  background: selectedTechnicianName === technician.fullName ? "#fdf2f8" : "#fff",
                  border: selectedTechnicianName === technician.fullName ? "1px solid #be185d" : "1px solid #e5e7eb",
                  color: selectedTechnicianName === technician.fullName ? "#be185d" : "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {technician.avatarUrl ? (
                    <img src={buildAssetUrl(technician.avatarUrl)} alt={technician.fullName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", background: "#f3f4f6", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon icon="zi-user" style={{ color: "#be185d", fontSize: 18 }} />
                    </div>
                  )}
                  <span>{technician.fullName}</span>
                </div>
                {selectedTechnicianName === technician.fullName && <Icon icon="zi-check" size={20} style={{ color: "#be185d", flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </Page>
  );
};

export default ClientReviewsPage;
