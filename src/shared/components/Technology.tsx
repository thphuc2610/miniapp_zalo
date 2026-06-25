import React from "react";

const Technology = () => {
  return (
    <div
      style={{
        margin: "12px auto 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          color: "#777",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        Phát triển bởi
      </span>

      <span
        aria-label="TitKul"
        style={{
          fontWeight: 800,
          fontSize: 14,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "#263f8f" }}>Tit</span>
        <span style={{ color: "#d71920" }}>Kul</span>
      </span>
    </div>
  );
};

export default Technology;



