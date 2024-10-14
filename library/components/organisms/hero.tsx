"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";
import { GlobeMethods } from "react-globe.gl";

import LinkButton from "@/components/molecules/link-button";

const Globe = dynamic(() => import("@/components/organisms/wrapped-globe"), {
  ssr: false,
  // loading: () => <div>Loading...</div>,
});

const Hero = () => {
  const globeRef = useRef<GlobeMethods>();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (globeRef.current && typeof window !== "undefined") {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 2.0;
      globeRef.current.controls().maxDistance = 310;
      globeRef.current.controls().minDistance = 310;
      globeRef.current.controls().enableZoom = false;
    }
  }, [loaded]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="bg-gradient-to-b from-cyan-600 to-[#000011] h-[calc(100vh-80px)] text-white flex justify-center w-full"
      onWheel={handleWheel}
    >
      <div className="flex gap-7 items-center justify-between w-full max-w-screen-xl px-8">
        <div className=" flex flex-col gap-8 w-[506px]">
          <div className=" flex flex-col gap-6 justify-start">
            <p className=" font-atyp text-[64px] leading-[80px]">
              Caption your video get more&nbsp;context
            </p>
            <p className=" text-sm">
              Making content accessible to millions of visually impaired users.
              Caption your videos in just a few taps
            </p>
          </div>
          <div className=" flex gap-6">
            <LinkButton
              href="/services/video-caption"
              className="bg-[#138FA8] active:bg-[#138FA8] py-3 px-6 rounded-[32px] font-outfit font-medium"
              text={"Caption a Video"}
            />
            <LinkButton
              className="bg-transparent active:bg-transparent border-white border flex gap-2 py-3 px-6 rounded-[32px] items-center font-outfit font-medium"
              href="/console"
              text={"Become a Node"}
              buttonImg="sort.svg"
            />
          </div>
        </div>
        <Globe
          onGlobeReady={() => setLoaded(true)}
          globeRef={globeRef}
          width={600}
          height={586}
          globeImageUrl="/earth-night.jpg"
          backgroundColor="rgba(0, 0, 0, 0)"
          atmosphereColor="rgba(0, 234, 255, 0.665)"
          atmosphereAltitude={0.3}
        />
      </div>
    </div>
  );
};

export default Hero;
