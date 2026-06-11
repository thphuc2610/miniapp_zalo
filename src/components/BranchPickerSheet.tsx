import React, { FC, useState, useEffect } from "react";
import { Sheet, Box, Icon } from "zmp-ui";
import { useRecoilState } from "recoil";
import { selectedBranchState } from "state";
import { getSpaBranches, SpaBranch } from "service/spaData";

interface BranchPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  mandatory?: boolean;
}

export const BranchPickerSheet: FC<BranchPickerSheetProps> = ({ visible, onClose, mandatory = false }) => {
  const [selectedBranch, setSelectedBranch] = useRecoilState(selectedBranchState);
  const [branches, setBranches] = useState<SpaBranch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("branch-picker-open", visible);

    return () => {
      document.body.classList.remove("branch-picker-open");
    };
  }, [visible]);

  useEffect(() => {
    getSpaBranches().then((data) => {
      setBranches(data || []);
      setLoading(false);
      
      // Auto-select if only one branch exists
      if (data && data.length === 1 && !selectedBranch) {
        setSelectedBranch(data[0]);
        onClose();
      }
    });
  }, []);

  const handleSelect = (branch: SpaBranch) => {
    setSelectedBranch(branch);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      mask
      handler={!mandatory}
      autoHeight
      className="branch-picker-sheet"
    >
      <Box p={4} style={{ background: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24  }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 50,
            height: 5,
            background: "#e2e8f0",
            borderRadius: 999,
            margin: "0 auto 16px"
          }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#831843" }}>Chọn chi nhánh phục vụ</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto", padding: "4px 0" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af" }}>Đang tải danh sách...</div>
          ) : branches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af" }}>Không tìm thấy chi nhánh nào.</div>
          ) : (
            branches.map((branch) => {
              const isActive = selectedBranch?.id === branch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => handleSelect(branch)}
                  style={{
                    padding: "16px",
                    borderRadius: 16,
                    border: isActive ? "2.5px solid #be185d" : "1.5px solid #f1f5f9",
                    background: isActive ? "#fff1f2" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 4px 12px rgba(190, 24, 93, 0.08)" : "none"
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isActive ? "#be185d" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isActive ? "#fff" : "#64748b",
                    flexShrink: 0
                  }}>
                    <Icon icon="zi-location-solid" />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 640, color: isActive ? "#831843" : "#1e293b" }}>{branch.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>{branch.address}</div>
                  </div>

                  {isActive && (
                    <div style={{ color: "#be185d" }}>
                      <Icon icon="zi-check-circle-solid" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Box>
    </Sheet>
  );
};
