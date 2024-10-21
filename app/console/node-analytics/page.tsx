"use client";

import dynamic from "next/dynamic";
import React, { useLayoutEffect, useRef, useState } from "react";
import { GlobeMethods } from "react-globe.gl";

import { cn } from "@/utils";
import VideoQueueManager from "@/components/organisms/video-queue-manager";

const Globe = dynamic(() => import("@/components/organisms/wrapped-globe"), {
  ssr: false,
});

const analytics = [
  {
    resource: "Splits Processed",
    value: "2.2k",
    action: { value: "View ↗", call: () => {} },
  },
  {
    resource: "Session Rewards",
    value: "2.2k",
    action: { value: "Collect ↗", call: () => {} },
  },
  {
    resource: "Total Staked",
    value: "2.2k",
    action: { value: "Stake More ↗", call: () => {} },
  },
];

const N = 250;
const gData = Array.from({ length: N }, () => ({
  lat: (Math.random() - 0.5) * 180,
  lng: (Math.random() - 0.5) * 360,
  size: Math.random() / 3,
  color: ["red", "white", "blue", "green"][Math.floor(Math.random() * 4)],
  crystal: ["DePIN", "Video", "Caption", "Network"][
    Math.floor(Math.random() * 4)
  ],
}));

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-[20px] border-[1px] border-[#EFF1F8] p-4 shadow-[0_0_50px_7px_rgba(0,0,0,0.05)] bg-white",
        className
      )}
    >
      {children}
    </div>
  );
};

const NodeAnalytics = () => {
  const globeRef = useRef<GlobeMethods>();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (globeRef.current && typeof window !== "undefined") {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 2.0;
      globeRef.current.controls().maxDistance = 320;
      globeRef.current.controls().minDistance = 320;
      globeRef.current.controls().enableZoom = false;
    }
  }, [loaded]);

  return (
    <div className="flex justify-center flex-1 w-full">
      <div className="flex flex-col ">
        <div className="flex flex-col p-4 min-w-fit gap-4">
          <h1 className="font-outfit font-semibold w-full gap-4">
            Node Analytics
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <Card className="min-w-80 w-fit flex-row justify-between">
              <div className="flex flex-col gap-6">
                <p className="font-outfit font-semibold text-[#484E62]">
                  Total Cycles
                </p>
                <p className="text-4xl font-outfit font-bold text-[#02071E]">
                  2.2k
                </p>
              </div>
            </Card>

            {analytics.map((item, index) => (
              <Card
                key={index}
                className="min-w-80 w-fit flex-row justify-between cursor-pointer"
              >
                <div className="flex flex-col gap-6">
                  <p className="font-outfit font-semibold text-[#484E62]">
                    {item.resource}
                  </p>
                  <p className="text-4xl font-outfit font-bold text-[#02071E]">
                    {item.value}
                  </p>
                </div>
                <p className="font-atyp text-sm text-[#34C759] font-bold">
                  {item.action.value}
                </p>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex justify-center overflow-hidden mb-4 h-[275px]">
          <div className="-mt-4">
            <Globe
              onGlobeReady={() => setLoaded(true)}
              globeRef={globeRef}
              width={600}
              height={500}
              globeImageUrl="/earth-day.jpeg"
              backgroundColor="rgba(0, 0, 0, 0)"
              atmosphereColor="rgba(0, 234, 255, 0.665)"
              atmosphereAltitude={0.3}
              pointsData={gData}
              arcsData={gData}
              pointAltitude="size"
              pointColor="color"
              pointLabel="crystal"
            />
          </div>
        </div>

        <VideoQueueManager />
      </div>
    </div>
  );
};

export default NodeAnalytics;
