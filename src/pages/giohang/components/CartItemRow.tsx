import React, { FC, useState } from "react";

interface CartItemRowProps {
  item: any;
  idx: number;
  isSelected: boolean;
  toggleSelect: (index: number) => void;
  updateQuantity: (index: number, delta: number) => void;
  handleDelete: (index: number) => void;
}

export const CartItemRow: FC<CartItemRowProps> = ({
  item,
  idx,
  isSelected,
  toggleSelect,
  updateQuantity,
  handleDelete
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diffX = e.touches[0].clientX - startX;
    if (isSwiped) {
      if (diffX > 0) {
        setCurrentX(Math.min(0, -80 + diffX));
      } else {
        setCurrentX(Math.max(-100, -80 + diffX));
      }
    } else {
      if (diffX < 0) {
        setCurrentX(Math.max(-80, diffX));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (isSwiped) {
      if (currentX > -40) {
        setIsSwiped(false);
        setCurrentX(0);
      } else {
        setCurrentX(-80);
      }
    } else {
      if (currentX < -40) {
        setIsSwiped(true);
        setCurrentX(-80);
      } else {
        setCurrentX(0);
      }
    }
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background: "#fee2e2",
        border: "1px solid #fce7f3",
      }}
    >
      <div
        onClick={() => handleDelete(idx)}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 80,
          background: "#ef4444",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: 2 }}>
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>      
        </svg>
        <span style={{ fontSize: 10, fontWeight: 800 }}>Xóa</span>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          background: "#fff",
          padding: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          transform: `translate3d(${currentX}px, 0, 0)`,
          transition: isSwiping ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(idx);
          }}
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            border: isSelected ? "none" : "2px solid #db2777",
            background: isSelected ? "linear-gradient(135deg, #db2777 0%, #be185d 100%)" : "transparent",       
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {isSelected && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>

        <img
          src={item.image}
          alt=""
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            objectFit: "cover",
            flexShrink: 0
          }}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>      
            <strong style={{
              fontSize: 12.5,
              color: "#1f2937",
              lineHeight: 1.3,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              flex: 1
            }}>
              {item.title}
            </strong>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#be185d", flexShrink: 0 }}>{item.price}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: "#be185d", fontWeight: 700, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                {item.technicianId && item.technicianName ? `${item.technicianName} • ` : ""}{item.time || ""} - {item.date || ""}
              </span>
              <span style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                {item.branch ? item.branch.replace("Tâm Nhất Beauty Spa & Healthy - ", "") : ""}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 8, border: "1px solid #fce7f3", padding: "2px", width: 76, flexShrink: 0 }}>
              <button
                onClick={() => updateQuantity(idx, -1)}
                style={{
                  border: "none", background: "#fdf2f8", color: "#be185d", width: 22, height: 22, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#be185d", textAlign: "center", flex: 1 }}>  
                {item.quantity || 1}
              </span>
              <button
                onClick={() => updateQuantity(idx, 1)}
                style={{
                  border: "none", background: "#fdf2f8", color: "#be185d", width: 22, height: 22, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
