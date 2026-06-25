import { SpaBranch } from "types/common";
import React, { FC, useState, useEffect } from "react";
import { Sheet, Box, Icon } from "zmp-ui";
import { useRecoilState } from "recoil";
import { selectedBranchState } from "state";
import { getSpaBranches } from "service/spaData";

const BRANCH_NAME_PREFIXES = [
  "Tâm Nhất Beauty Spa & Healthy - ",
  "Tâm Nhất Beauty & Healthy Spa - ",
  "Tam Nhat Beauty Spa & Healthy - ",
];

interface BranchPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  mandatory?: boolean;
}

const getBranchKey = (branch: SpaBranch) =>
  String(branch.id || `${branch.name}-${branch.address}`).trim().toLowerCase();

const getBranchDisplayName = (name: string) =>
  BRANCH_NAME_PREFIXES.reduce((displayName, prefix) => displayName.replace(prefix, ""), name).trim();

const getUniqueBranches = (items: SpaBranch[]) => {
  const seen = new Set<string>();

  return items.filter((branch) => {
    const key = getBranchKey(branch);
    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

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
      const uniqueBranches = getUniqueBranches(data || []);

      setBranches(uniqueBranches);
      setLoading(false);

      if (uniqueBranches.length === 1 && !selectedBranch) {
        setSelectedBranch(uniqueBranches[0]);
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
      handler
      autoHeight
      className="branch-picker-sheet"
    >
      <Box p={4} style={{ background: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24  }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
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
              const branchName = getBranchDisplayName(branch.name);
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
                    boxShadow: isActive ? "var(--shadow-card)" : "0 4px 12px rgba(15, 23, 42, 0.04)"
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
                    <div style={{ fontSize: 14.5, fontWeight: 640, color: isActive ? "#831843" : "#1e293b" }}>{branchName}</div>
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
