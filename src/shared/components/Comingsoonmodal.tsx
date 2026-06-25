import React, { FC } from "react";
import { Modal, Box, Icon, Button } from "zmp-ui";
import { useRecoilState } from "recoil";
import { ModalComingSoonState } from "state";

const ComingSoonModal: FC = () => {
  const [visible, setVisible] = useRecoilState(ModalComingSoonState);

  return (
    <Modal
      visible={visible}
      onClose={() => setVisible(false)}
      title=""
      modalStyle={{
        background: "#fff",
        borderRadius: 24,
        padding: "24px 20px",
        textAlign: "center",
      }}
    >
      <Box flex flexDirection="column" alignItems="center" justifyContent="center">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#fdf2f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            border: "2px solid #fce7f3",
          }}
        >
          <Icon icon="zi-clock-2" style={{ color: "#be185d", fontSize: 42 }} />
        </div>

        <strong
          style={{
            fontSize: 20,
            color: "#831843",
            marginBottom: 10,
            display: "block",
            fontWeight: 800,
          }}
        >
          Tính năng đang được phát triển
        </strong>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
            marginBottom: 24,
            padding: "0 10px",
          }}
        >
          Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau nhé!
        </p>

        <Button
          fullWidth
          onClick={() => setVisible(false)}
          style={{
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            fontSize: 15,
            fontWeight: 800,
            boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
            border: "none",
          }}
        >
          Đã hiểu
        </Button>
      </Box>
    </Modal>
  );
};

export default ComingSoonModal;
