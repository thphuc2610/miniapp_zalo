import React, { FC, useEffect, useState } from "react";
import { Header, Page, useSnackbar } from "zmp-ui";
import { createSpaReview, getCustomerProfile, getSpaReviews, getSpaServices, getSpaTechnicians } from "service/spaData";
import { useAuthCheck } from "hooks/useAuthCheck";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const reviewTargets = [
  { value: "service", label: "Đánh giá dịch vụ" },
  { value: "technician", label: "Đánh giá kỹ thuật viên" },
  { value: "general", label: "Góp ý chung" },
];

const text = {
  pageTitle: "Đánh giá từ khách hàng",
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

const selectChevronStyle: React.CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: "#be185d",
  fontSize: 13,
  fontWeight: 800,
};

const parseReviewCreatedAt = (value?: string | null) => {
  if (!value) return null;
  const text = String(value).trim();
  const normalized = text.replace(" ", "T");
  const date = dayjs(normalized);
  return date.isValid() ? date : null;
};

const formatReviewCreatedAt = (value?: string | null) => parseReviewCreatedAt(value)?.fromNow() || "";
const normalizeHalfRating = (value: number) => Math.max(0.5, Math.min(10, Math.round(value * 2) / 2));

function SelectChevron() {
  return <span style={selectChevronStyle}>v</span>;
}

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

  const stats = {
    avg: reviewsList.length > 0 ? (reviewsList.reduce((acc, item) => acc + Number(item.rating || 0), 0) / reviewsList.length).toFixed(1) : "5.0",
    count: reviewsList.length,
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
              const count = reviewsList.filter((item) => Math.round(Number(item.rating || 0) / 2) === star).length;
              const percent = reviewsList.length > 0 ? `${((count / reviewsList.length) * 100).toFixed(0)}%` : "0%";
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
            reviewsList.map((review) => (
              <div key={review.id} style={{ background: "#fff", borderRadius: 20, padding: 14, border: "1px solid #fce7f3", boxShadow: "0 4px 16px rgba(131,24,67,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {review.customerAvatar ? (
                        <img src={review.customerAvatar} alt={review.customerName || text.generalFeedback} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : "*"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: 13, color: "#1f2937", display: "block" }}>{review.customerName}</strong>
                      <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
                        {review.serviceName || text.generalFeedback} - {formatReviewCreatedAt(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <StarMeter value={Number(review.rating || 0)} size={10} />
                </div>
                <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, textAlign: "left" }}>{review.content || review.comment}</p>
              </div>
            ))
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
            <div style={selectWrapStyle}>
              <select value={reviewTarget} onChange={(e) => setReviewTarget(e.target.value)} style={selectStyle}>
                <option value="">{text.targetPlaceholder}</option>
                {reviewTargets.map((target) => (
                  <option key={target.value} value={target.value}>{target.label}</option>
                ))}
              </select>
              <SelectChevron />
            </div>
            {reviewTarget === "service" && (
              <div style={selectWrapStyle}>
                <select value={selectedServiceName} onChange={(e) => setSelectedServiceName(e.target.value)} style={selectStyle}>
                  <option value="">{text.servicePlaceholder}</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>{service.title}</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            )}
            {reviewTarget === "technician" && (
              <div style={selectWrapStyle}>
                <select value={selectedTechnicianName} onChange={(e) => setSelectedTechnicianName(e.target.value)} style={selectStyle}>
                  <option value="">{text.technicianPlaceholder}</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.fullName}>{technician.fullName}</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            )}
            <textarea placeholder={text.commentPlaceholder} rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ width: "100%", borderRadius: 10, border: "1px solid #fce7f3", padding: "10px 12px", fontSize: 13, fontWeight: 600, background: "#fdf2f8", outline: "none", resize: "none" }} />
            <button type="submit" disabled={submitting} style={{ width: "100%", height: 42, borderRadius: 12, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 10px rgba(190, 24, 93, 0.2)", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? text.submitting : text.submit}
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
};

export default ClientReviewsPage;
