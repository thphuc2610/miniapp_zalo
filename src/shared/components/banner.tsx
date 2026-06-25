import React, { useRef, useState } from "react";
import { FC } from "react";
import { Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";

export interface BannerSliderProps {
  banners: string[];
  height?: number | string;
  autoPlay?: boolean;
  interval?: number;
  borderRadius?: number | string;
}

const BannerSlider: FC<BannerSliderProps> = ({
  banners,
  height,
  autoPlay,
  interval,
  borderRadius,
}) => {
  const carouselRef = useRef<CarouselRef>(null);
  const [current, setCurrent] = useState(0);

  const total = banners.length;

  if (!banners || total === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        margin: "0",
        overflow: "hidden",
        borderRadius: borderRadius,
        border: "5px solid #ffffff",
        boxShadow: "0 14px 28px rgba(131, 24, 67, 0.12)",
      }}
    >
      <Carousel
        ref={carouselRef}
        autoplay={autoPlay}
        autoplaySpeed={interval}
        infinite
        dots={false}
        beforeChange={(_, next) => setCurrent(next)}
        style={{ height }}
      >
        {banners.map((src, i) => (
          <div key={i}>
            <img
              src={src}
              alt={`banner-${i}`}
              draggable={false}
              style={{
                width: "100%",
                height,
                objectFit: "cover",
                display: "block",
                borderRadius: 0,
              }}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerSlider;
