import React from "react";
import { useRecoilState } from "recoil";
import { Icon, Modal } from "zmp-ui";
import { openChat, openOutApp, openPhone, showToast } from "zmp-sdk";
import MY_CONFIG from "../../mock/myapp_config.json";
import { ContactSupportModalState } from "state";

const CONTACT_CONFIG = {
  hotline: "0942429989",
  oaId: MY_CONFIG.ID_OA,
  email: "hotro@hanthuyen.edu.vn",
};

type SupportAction = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>["icon"];
  onClick: () => void | Promise<void>;
};

const ContactSupportModal = () => {
  const [visible, setVisible] = useRecoilState(ContactSupportModalState);

  const closeModal = () => setVisible(false);

  const copyToClipboard = async (value: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Fall through to legacy copy handling.
    }

    if (typeof document === "undefined") {
      return false;
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  };

  const handleOpenHotline = async () => {
    const copied = await copyToClipboard(CONTACT_CONFIG.hotline);

    try {
      await openPhone({ phoneNumber: CONTACT_CONFIG.hotline });
      await showToast({
        message: copied ? "Đã sao chép số hotline" : "Đang mở ứng dụng gọi điện",
      });
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = `tel:${CONTACT_CONFIG.hotline}`;
        return;
      }

      await showToast({ message: "Không mở được ứng dụng gọi điện" });
    }
  };

  const handleOpenZalo = async () => {
    try {
      await openChat({
        type: "oa",
        id: CONTACT_CONFIG.oaId,
        message: "Xin chào, tôi cần được hỗ trợ.",
      });
    } catch {
      if (typeof window !== "undefined") {
        window.open(`https://zalo.me/${CONTACT_CONFIG.oaId}`, "_blank", "noopener,noreferrer");
        return;
      }

      await showToast({ message: "Không mở được Official Account" });
    }
  };

  const handleOpenEmail = async () => {
    const emailLink = `mailto:${CONTACT_CONFIG.email}`;

    try {
      await openOutApp({ url: emailLink });
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = emailLink;
        return;
      }

      await showToast({ message: "Không mở được email" });
    }
  };

  const actions: SupportAction[] = [
    {
      key: "hotline",
      label: "Hotline",
      icon: "zi-call",
      onClick: handleOpenHotline,
    },
    {
      key: "zalo",
      label: "Zalo",
      icon: "zi-chat",
      onClick: handleOpenZalo,
    },
    {
      key: "email",
      label: "Email",
      icon: "zi-at",
      onClick: handleOpenEmail,
    },
  ];

  return (
    <Modal visible={visible} onClose={closeModal}>
      <div
        style={{
          padding: "24px 18px 16px",
          background: "#fff",
          borderRadius: 24,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 17,
            fontWeight: 800,
            color: "#831843",
            marginBottom: 20,
          }}
        >
          Liên hệ hỗ trợ
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              style={{
                width: "100%",
                height: 50,
                border: "none",
                borderRadius: 999,
                background: "#be185d",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(190, 24, 93, 0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 18px",
              }}
              onClick={action.onClick}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  minWidth: 80,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    flexShrink: 0,
                    transform: "translateY(-1px)",
                  }}
                >
                  <Icon icon={action.icon} />
                </span>

                <span
                  style={{
                    marginLeft: 10,
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    textAlign: "left",
                  }}
                >
                  {action.label}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div
          style={{
            height: 1,
            background: "#E5E7EB",
            margin: "22px 0 14px",
          }}
        />

        <div
          onClick={closeModal}
          style={{
            textAlign: "right",
            color: "#374151",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            paddingRight: 2,
          }}
        >
          Đóng
        </div>
      </div>
    </Modal>
  );
};

export default ContactSupportModal;
