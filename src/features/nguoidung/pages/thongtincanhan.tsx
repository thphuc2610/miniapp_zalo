import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { Header, Page, useSnackbar } from "zmp-ui";
import { getCustomerProfile, updateCustomerProfile } from "service/spaData";

const pad2 = (value: number | string) => String(value).padStart(2, "0");
const normalizeDateValue = (value?: string | null) => String(value || "").slice(0, 10);
const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();

const formatBirthday = (value: string) => {
  const normalized = normalizeDateValue(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const pickerColumnStyle: React.CSSProperties = {
  height: 232,
  overflowY: "auto",
  display: "grid",
  gap: 8,
  padding: "95px 4px",
  scrollSnapType: "y mandatory",
  WebkitOverflowScrolling: "touch",
};

const PickerColumn: FC<{
  values: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  type: "day" | "month" | "year";
}> = ({ values, selectedValue, onSelect, type }) => {
  const colRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (colRef.current) {
      const index = values.indexOf(selectedValue);
      if (index >= 0) {
        isProgrammaticScroll.current = true;
        colRef.current.scrollTop = index * 50;
        setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;
    const target = e.currentTarget;
    const index = Math.max(0, Math.min(values.length - 1, Math.round(target.scrollTop / 50)));
    if (values[index] !== selectedValue) {
      onSelect(values[index]);
    }
  };

  return (
    <div ref={colRef} onScroll={handleScroll} style={pickerColumnStyle} className="hide-scrollbar">
      {values.map((value) => {
        const selected = selectedValue === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              if (colRef.current) {
                isProgrammaticScroll.current = true;
                colRef.current.scrollTo({ top: values.indexOf(value) * 50, behavior: 'smooth' });
                setTimeout(() => { isProgrammaticScroll.current = false; }, 300);
              }
              onSelect(value);
            }}
            style={{
              height: 42,
              border: selected ? "1px solid rgba(190, 24, 93, 0.3)" : "1px solid transparent",
              borderRadius: 12,
              background: selected ? "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)" : "transparent",
              color: selected ? "#be185d" : "#6b7280",
              fontSize: selected ? 18 : 15,
              fontWeight: selected ? 900 : 700,
              boxShadow: selected ? "0 8px 18px rgba(190, 24, 93, 0.12)" : "none",
              scrollSnapAlign: "center",
            }}
          >
            {type === "year" ? value : pad2(value)}
          </button>
        );
      })}
    </div>
  );
};

const PersonalInfoPage: FC = () => {
  const { openSnackbar } = useSnackbar();
  const currentYear = new Date().getFullYear();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("Nam");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isBirthdayPopupOpen, setIsBirthdayPopupOpen] = useState(false);
  const [draftDay, setDraftDay] = useState(1);
  const [draftMonth, setDraftMonth] = useState(1);
  const [draftYear, setDraftYear] = useState(currentYear - 25);

  const initialValues = useRef({ name: "", email: "", birthday: "", gender: "Nam" });

  const years = useMemo(() => Array.from({ length: 101 }, (_, index) => currentYear - index), [currentYear]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);
  const days = useMemo(
    () => Array.from({ length: getDaysInMonth(draftMonth, draftYear) }, (_, index) => index + 1),
    [draftMonth, draftYear],
  );

  useEffect(() => {
    const maxDay = getDaysInMonth(draftMonth, draftYear);
    if (draftDay > maxDay) setDraftDay(maxDay);
  }, [draftDay, draftMonth, draftYear]);

  useEffect(() => {
    let mounted = true;

    getCustomerProfile().then((profile) => {
      if (!mounted || !profile) return;

      const nextValues = {
        name: profile.fullName || "",
        email: profile.email || "",
        birthday: normalizeDateValue(profile.dateOfBirth),
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

  const openBirthdayPicker = () => {
    const normalized = normalizeDateValue(birthday);
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      setDraftYear(Number(match[1]));
      setDraftMonth(Number(match[2]));
      setDraftDay(Number(match[3]));
    } else {
      setDraftYear(currentYear - 25);
      setDraftMonth(1);
      setDraftDay(1);
    }

    setIsBirthdayPopupOpen(true);
  };

  useEffect(() => {
    if (isBirthdayPopupOpen) {
      setBirthday(`${draftYear}-${pad2(draftMonth)}-${pad2(draftDay)}`);
      setSaved(false);
    }
  }, [draftDay, draftMonth, draftYear, isBirthdayPopupOpen]);

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
        birthday: normalizeDateValue(result.data.dateOfBirth),
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
              onChange={(event) => { setName(event.target.value); setSaved(false); }}
              style={inputStyle}
              onFocus={(event) => (event.target.style.borderColor = "#be185d")}
              onBlur={(event) => (event.target.style.borderColor = "#fce7f3")}
            />
          </div>

          <div>
            <label style={labelStyle}>Số điện thoại</label>
            <div style={{ position: "relative" }}>
              <input type="tel" value={phone} readOnly style={disabledInputStyle} />
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
              onChange={(event) => { setEmail(event.target.value); setSaved(false); }}
              placeholder="Nhập email của bạn"
              style={inputStyle}
              onFocus={(event) => (event.target.style.borderColor = "#be185d")}
              onBlur={(event) => (event.target.style.borderColor = "#fce7f3")}
            />
          </div>

          <div>
            <label style={labelStyle}>Ngày sinh</label>
            <button
              type="button"
              onClick={openBirthdayPicker}
              style={{
                ...inputStyle,
                minHeight: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
                color: birthday ? "#1f2937" : "#9ca3af",
              }}
            >
              <span>{birthday ? formatBirthday(birthday) : "Chọn ngày sinh"}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </button>
          </div>

          <div>
            <label style={labelStyle}>Giới tính</label>
            <div style={{ display: "flex", gap: 24 }}>
              {["Nam", "Nữ", "Khác"].map((item) => {
                const selected = gender === item;
                return (
                  <div
                    key={item}
                    onClick={() => { setGender(item); setSaved(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
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
                      {selected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#be185d" }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: selected ? 700 : 600, color: selected ? "#be185d" : "#4b5563" }}>
                      {item}
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
            background: buttonDisabled ? "#e5e7eb" : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
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

      {isBirthdayPopupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(17, 24, 39, 0.38)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setIsBirthdayPopupOpen(false)}
        >
          <div
            style={{
              width: "min(100%, 390px)",
              borderRadius: 24,
              background: "#fff",
              padding: "18px 18px 16px",
              boxShadow: "0 24px 60px rgba(131, 24, 67, 0.22)",
              border: "1px solid rgba(252, 231, 243, 0.9)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#831843" }}>
                Chọn ngày sinh: <span style={{ color: "#be185d" }}>{pad2(draftDay)}/{pad2(draftMonth)}/{draftYear}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBirthdayPopupOpen(false)}
                aria-label="Đóng"
                style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #fce7f3", background: "#fff7fb", color: "#be185d", fontSize: 18, fontWeight: 900 }}
              >
                ×
              </button>
            </div>

            <div style={{ position: "relative", border: "1px solid #fce7f3", borderRadius: 18, background: "linear-gradient(180deg, #fff 0%, #fff7fb 100%)", overflow: "hidden", boxShadow: "0 14px 34px rgba(190, 24, 93, 0.1)" }}>
              <div style={{ position: "absolute", left: 12, right: 12, top: "50%", height: 46, transform: "translateY(-50%)", borderRadius: 14, background: "rgba(252, 231, 243, 0.55)", pointerEvents: "none" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1.25fr", gap: 4, position: "relative", zIndex: 1, padding: "0 8px" }}>
                <PickerColumn values={days} selectedValue={draftDay} onSelect={setDraftDay} type="day" />
                <div style={{ width: 1, background: "linear-gradient(to bottom, transparent 10%, rgba(190, 24, 93, 0.12) 30%, rgba(190, 24, 93, 0.12) 70%, transparent 90%)", margin: "24px 0" }} />
                <PickerColumn values={months} selectedValue={draftMonth} onSelect={setDraftMonth} type="month" />
                <div style={{ width: 1, background: "linear-gradient(to bottom, transparent 10%, rgba(190, 24, 93, 0.12) 30%, rgba(190, 24, 93, 0.12) 70%, transparent 90%)", margin: "24px 0" }} />
                <PickerColumn values={years} selectedValue={draftYear} onSelect={setDraftYear} type="year" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default PersonalInfoPage;
