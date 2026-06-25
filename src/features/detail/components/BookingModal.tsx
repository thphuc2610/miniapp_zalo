import React, { FC, useState, useEffect } from "react";
import { Modal, useSnackbar } from "zmp-ui";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: string;
}

export const BookingModal: FC<BookingModalProps> = ({ isOpen, onClose, title, price }) => {
  const { openSnackbar } = useSnackbar();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("Chi nhánh Quận 1 (Chính)");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  const branches = [
    "Chi nhánh Quận 1 (Chính) - 45 Mạc Đĩnh Chi",
    "Chi nhánh Bình Thạnh - 182 Điện Biên Phủ",
    "Chi nhánh Quận 7 - 302 Nguyễn Thị Thập"
  ];

  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30"];

  useEffect(() => {
    if (isOpen) {
      setBookingSuccess(false);
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [isOpen]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      openSnackbar({ text: "Vui lòng chọn ngày đặt lịch", type: "error" });
      return;
    }
    setBookingSuccess(true);
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title=""
      modalStyle={{ background: "#fff", borderRadius: 24, padding: "20px 16px", maxWidth: "90%" }}
    >
      {!bookingSuccess ? (
        <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#831843", textAlign: "center", marginBottom: 6 }}>Đặt lịch hẹn trải nghiệm</h3>
          
          {}
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#be185d", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Chọn Chi Nhánh</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "1px solid rgba(190, 24, 93, 0.18)",
                padding: "0 10px",
                fontSize: 13,
                fontWeight: 800,
                color: "#1f2937",
                background: "#fff",
                outline: "none"
              , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
            >
              {branches.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {}
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#be185d", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Chọn Ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "1px solid rgba(190, 24, 93, 0.18)",
                padding: "0 10px",
                fontSize: 13,
                fontWeight: 800,
                color: "#1f2937",
                outline: "none"
              , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
            />
          </div>

          {}
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#be185d", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Giờ Hẹn</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    border: "none",
                    background: selectedTime === slot ? "#be185d" : "#fdf2f8",
                    color: selectedTime === slot ? "#fff" : "#be185d",
                    padding: "8px 0",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    transition: "all 0.2s ease"
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {}
          <div style={{ background: "#fdf2f8", padding: 12, borderRadius: 12, border: "1px dashed #fbcfe8", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontSize: 13, color: "#831843", fontWeight: 800 }}>Tổng tiền dịch vụ:</span>
            <span style={{ fontSize: 16, fontWeight: 850, color: "#be185d" }}>{price}</span>
          </div>

          {}
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
              color: "#fff",
              border: "none",
              height: 46,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              marginTop: 10,
              boxShadow: "0 4px 12px rgba(190,24,93,0.3)"
            }}
          >
            Xác Nhận Đặt Hẹn
          </button>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "1px solid rgba(190, 24, 93, 0.32)" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#831843", marginBottom: 8 }}>Đặt lịch thành công!</h3>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, marginBottom: 16 }}>
            Lịch hẹn của bạn đã được tiếp nhận tại <br />
            <strong style={{ color: "#be185d" }}>{selectedBranch.split(" - ")[0]}</strong> lúc <strong style={{ color: "#be185d" }}>{selectedTime}</strong> ngày <strong style={{ color: "#be185d" }}>{selectedDate.split("-").reverse().join("/")}</strong>. <br />
            Nhân viên Tâm Nhất Beauty Spa & Healthy sẽ gọi điện xác nhận trong ít phút.
          </p>
          <button
            onClick={onClose}
            style={{
              background: "#be185d",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Hoàn Thành
          </button>
        </div>
      )}
    </Modal>
  );
};
