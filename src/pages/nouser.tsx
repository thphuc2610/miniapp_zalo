import React, { FC, Suspense, useEffect, useState } from "react";
import { Header, Page } from "zmp-ui";

import { useNavigate } from "react-router";
import NoService from "../components/noservice";
const NouserPage: FC = () => {
  const navigate = useNavigate();
  return (
    <Page style={{ display: "flex", flexDirection: "column" }}>
      <Header
        backgroundColor="var(--color-header)"
        textColor={"#fff"}
        title="Đăng nhập"
        style={{ minWidth: "auto" }}
      />
      <NoService />
    </Page>
  );
};

export default NouserPage;
