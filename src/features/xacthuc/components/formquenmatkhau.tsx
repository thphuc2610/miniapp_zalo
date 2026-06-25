import React, { FC, useState } from "react";

export const Formquenmatkhau: FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = () => {
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      startCountdown();
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !otp || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setLoading(true);
    // Simulate resetting password
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#1f2937",
    border: "1.5px solid #fce7f3",
    borderRadius: "12px",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 800,
    color: "#831843",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
    display: "block",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(190,24,93,0.2)",
    transition: "all 0.3s ease",
  };

  const containerStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px 20px",
    border: "1px solid #be185d",
    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  };

  if (success) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", padding: "40px 20px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", margin: "0 0 8px" }}>
          Đặt lại mật khẩu thành công!
        </h3>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
          Bạn đã khôi phục mật khẩu thành công. Hãy đăng nhập lại bằng mật khẩu mới của bạn.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px", textAlign: "center" }}>
        Khôi Phục Mật Khẩu
      </h2>
      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 8px", textAlign: "center", fontWeight: 500 }}>
        Nhập số điện thoại để nhận mã OTP khôi phục tài khoản
      </p>

      {error && (
        <div
          style={{
            padding: "10px 12px",
            background: "#fef2f2",
            border: "1px solid #be185d",
            borderRadius: "10px",
            color: "#b91c1c",
            fontSize: "12.5px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px", boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {}
      <div>
        <label style={labelStyle}>Số điện thoại</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={otpSent}
            placeholder="Nhập số điện thoại đăng ký"
            style={{
              ...inputStyle,
              flex: 1,
              background: otpSent ? "#f9fafb" : "#fff",
              color: otpSent ? "#9ca3af" : "#1f2937",
            }}
          />
          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                padding: "0 16px",
                background: "#fdf2f8",
                border: "1.5px solid #fbcfe8",
                borderRadius: "12px",
                color: "#be185d",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          )}
        </div>
      </div>

      {otpSent && (
        <>
          {}
          <div>
            <label style={labelStyle}>
              Mã xác thực OTP
              {countdown > 0 && (
                <span style={{ fontSize: "11px", color: "#be185d", textTransform: "none", marginLeft: "6px" }}>
                  (Gửi lại sau {countdown}s)
                </span>
              )}
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP gồm 6 chữ số"
                style={inputStyle}
              />
              {countdown === 0 && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    padding: "0 16px",
                    background: "#fdf2f8",
                    border: "1.5px solid #fbcfe8",
                    borderRadius: "12px",
                    color: "#be185d",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Gửi lại
                </button>
              )}
            </div>
          </div>

          {}
          <div>
            <label style={labelStyle}>Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              style={inputStyle}
            />
          </div>

          {}
          <div>
            <label style={labelStyle}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              style={inputStyle}
            />
          </div>

          {}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
          </button>
        </>
      )}
    </form>
  );
};
