import React, { FC, useState, useEffect, useRef } from "react";
import { Page, Header, useSnackbar } from "zmp-ui";
import { getCustomerProfile, updateCustomerProfile } from "service/spaData";

const PersonalInfoPage: FC = () => {
  const { openSnackbar } = useSnackbar();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("Nam");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initialValues = useRef({ name: "", email: "", birthday: "", gender: "Nam" });

  useEffect(() => {
    let mounted = true;

    getCustomerProfile().then((profile) => {
      if (!mounted || !profile) return;

      const nextValues = {
        name: profile.fullName || "",
        email: profile.email || "",
        birthday: profile.dateOfBirth || "",
        gender: profile.gender || "Nam",
      };

      setName(nextValues.name);
      setPhone(profile.phone || "");
      setAvatar(profile.avatarUrl || "");
      setEmail(nextValues.email);
      setBirthday(nextValues.birthday);
      setGender(nextValues.gender);
      initialValues.current = nextValues;
    });

    return () => {
      mounted = false;
    };
  }, []);

  const isDirty =
    name !== initialValues.current.name ||
    email !== initialValues.current.email ||
    birthday !== initialValues.current.birthday ||
    gender !== initialValues.current.gender;

  const handleSave = async () => {
    if (!isDirty || saving || saved) return;
    setSaving(true);

    const result = await updateCustomerProfile({
      fullName: name.trim(),
      email: email.trim() || null,
      dateOfBirth: birthday || null,
      gender: gender || null,
      avatarUrl: avatar || null,
    });

    setSaving(false);
    if (result.success && result.data) {
      setSaved(true);
      initialValues.current = {
        name: result.data.fullName || "",
        email: result.data.email || "",
        birthday: result.data.dateOfBirth || "",
        gender: result.data.gender || "Nam",
      };
      setName(initialValues.current.name);
      setEmail(initialValues.current.email);
      setBirthday(initialValues.current.birthday);
      setGender(initialValues.current.gender);
      openSnackbar({ text: "Đã lưu thông tin cá nhân", type: "success" });
    } else {
      openSnackbar({ text: result.message || "Không thể lưu thông tin cá nhân", type: "error" });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 600,
    color: "#1f2937",
    border: "1.5px solid #fce7f3",
    borderRadius: 12,
    background: "#fff",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const disabledInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: "#f9fafb",
    color: "#9ca3af",
    cursor: "not-allowed",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    color: "#831843",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    display: "block",
  };

  const buttonDisabled = !isDirty || saving || saved;

  return (
    <Page className="page-shell" style={{ background: "#fdf2f8", minHeight: "100vh" }}>
      <Header
        title="Thông tin cá nhân"
        showBackIcon={true}
        style={{ fontSize: 18, fontWeight: 800, textAlign: "center", background: "var(--color-2)" }}
      />

      <div style={{ padding: "20px 20px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              border: "4px solid #fff",
              boxShadow: "0 8px 20px rgba(131, 24, 67, 0.15)",
              overflow: "hidden",
              margin: "0 auto",
              background: "#fff",
            }}
          >
            {avatar ? (
              <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fce7f3" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#be185d")}
              onBlur={(e) => (e.target.style.borderColor = "#fce7f3")}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Số điện thoại
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="tel"
                value={phone}
                readOnly
                style={disabledInputStyle}
              />
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
              placeholder="Nhập email của bạn"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#be185d")}
              onBlur={(e) => (e.target.style.borderColor = "#fce7f3")}
            />
          </div>

          <div>
            <label style={labelStyle}>Ngày sinh</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => { setBirthday(e.target.value); setSaved(false); }}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#be185d")}
              onBlur={(e) => (e.target.style.borderColor = "#fce7f3")}
            />
          </div>

          <div>
            <label style={labelStyle}>Giới tính</label>
            <div style={{ display: "flex", gap: 24 }}>
              {["Nam", "Nữ", "Khác"].map((g) => {
                const selected = gender === g;
                return (
                  <div
                    key={g}
                    onClick={() => { setGender(g); setSaved(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: selected ? "2px solid #be185d" : "2px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {selected && (
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#be185d" }} />
                      )}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: selected ? 700 : 600, color: selected ? "#be185d" : "#4b5563" }}>
                      {g}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 20px calc(env(safe-area-inset-bottom) + 12px)",
          background: "rgba(253,242,248,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid #fce7f3",
          zIndex: 100,
        }}
      >
        <button
          onClick={handleSave}
          disabled={buttonDisabled}
          style={{
            width: "100%",
            padding: "14px 0",
            background: buttonDisabled
              ? "#e5e7eb"
              : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            color: buttonDisabled ? "#9ca3af" : "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 800,
            cursor: buttonDisabled ? "not-allowed" : "pointer",
            boxShadow: buttonDisabled ? "none" : "0 4px 12px rgba(190,24,93,0.25)",
            transition: "all 0.3s ease",
            opacity: buttonDisabled ? 0.6 : 1,
          }}
        >
          {saving ? "Đang lưu..." : saved ? "✓ Đã lưu thành công" : "Lưu thay đổi"}
        </button>
      </div>
    </Page>
  );
};

export default PersonalInfoPage;
