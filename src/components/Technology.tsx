import React from "react";
import Titkul from "../static/titkul.png";

const Technology = () => {
  return (
    <div
      style={{
        margin: "12px auto 20px",
        background: "#fff",
        borderRadius: 999,
        padding: "0 18px",
        width: "fit-content",
        maxWidth: "90%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        boxShadow: "0 4px 10px rgba(0,0,0,0.12)",    
      }}
    >
      <span
        style={{
          color: "#123f6d",
          fontWeight: 800,
          fontSize: 12,
          whiteSpace: "nowrap",
        }}
      >
        Giải pháp công nghệ của
      </span>

      <img
        src={Titkul}
        alt="logo T"
        style={{
          height: 40,
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
};

export default Technology;
