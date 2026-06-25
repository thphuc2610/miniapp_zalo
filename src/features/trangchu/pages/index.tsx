import React, { FC, useRef, useEffect, useState } from "react";
import { Page } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { selectedBranchState } from "state";

import ComingSoonModal from "components/Comingsoonmodal";
import Technology from "components/Technology";
import BannerSlider from "components/banner";
import { BranchPickerSheet } from "components/BranchPickerSheet";

import { HeaderSection } from "../components/HeaderSection";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { FeaturesGrid } from "../components/FeaturesGrid";
import { FeaturedServices } from "../components/FeaturedServices";
import { ServiceGroups } from "../components/ServiceGroups";
import { MembershipList } from "../components/MembershipList";
import { NewsList } from "../components/NewsList";
import { getSpaBanners } from "service/spaData";     
import { buildAssetUrl } from "utils/common";        

const HomePage: FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);    
  const [banners, setBanners] = useState<string[]>([]);
  const selectedBranch = useRecoilValue(selectedBranchState);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  useEffect(() => {
    getSpaBanners().then(data => {
      if (data && data.length > 0) {
        setBanners(data.map(b => buildAssetUrl(b.imageUrl)));
      }
    });
  }, []);

  // Show branch picker on startup if not selected
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!selectedBranch) {
        setIsPickerVisible(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedBranch]);

  // Restore scroll position
  useEffect(() => {
    let timer: any;
    if (scrollRef.current) {
      const savedScroll = (window as any).homeScrollY || 0;
      timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = savedScroll; 
        }
      }, 30);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    (window as any).homeScrollY = e.currentTarget.scrollTop;
  };

  return (
    <Page style={{ height: "100vh", background: "var(--app-bg)", position: "relative" }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: "100%", overflowY: "auto", paddingBottom: "calc(112px + env(safe-area-inset-bottom))", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 214,
            background: "var(--color-2)",
            borderBottomLeftRadius: 26,
            borderBottomRightRadius: 26,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
            zIndex: 0,
          }}
        />

        <HeaderSection onOpenPicker={() => setIsPickerVisible(true)} />

        <div style={{ position: "relative", zIndex: 1, padding: "12px 16px 0" }}>
          {banners.length > 0 && (
            <BannerSlider
              banners={banners}
              autoPlay
              interval={3500}
              height={218}
              borderRadius={20}
            />
          )}

          <SubscriptionCard />

          <FeaturesGrid />

          <FeaturedServices />

          <ServiceGroups />

          <MembershipList />

          <NewsList />

          <Technology />
        </div>
      </div>

      <ComingSoonModal />

      <BranchPickerSheet 
        visible={isPickerVisible} 
        onClose={() => setIsPickerVisible(false)}
        mandatory={!selectedBranch}
      />
    </Page>
  );
};

export default HomePage;
