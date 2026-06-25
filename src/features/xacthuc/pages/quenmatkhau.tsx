import React from "react";
import { FC } from "react";
import { Page } from "zmp-ui";
import { Formquenmatkhau } from "../components/formquenmatkhau";
import { getConfig } from "utils/config";
import MY_CONFIG from "../../../../mock/myapp_config.json";

const QuenMatKhauPage: FC = () => {
  return (
    <>
      <Page style={{ paddingTop: "30%", backgroundColor: "var(--login-bg)" }}>
        <div>
          <img
            style={{
              width: "120px",
              padding: "10px",
              margin: "auto",
              backgroundColor: "#fff",
              borderRadius: "100%",
            }}
            className=""
            src={getConfig((c) => c.template.headerLogo) || MY_CONFIG.LOGOTRUONG}
          />
        </div>
        <div style={{ padding: "20px" }}>
          <Formquenmatkhau />
        </div>
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            fontSize: "1em",
            width: "100%",
            color: "#fff",
          }}
          className="text-center"
        >
          <h3 style={{ margin: "0px", fontSize: "1.2em", fontWeight: "bold" }}>
            Tâm Nhất Beauty & Healthy Spa
          </h3>
          Hệ thống quản lý khách hàng
        </div>
      </Page>
    </>
  );
};

export default QuenMatKhauPage;
