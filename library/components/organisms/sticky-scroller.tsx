"use client";

// import Image from "next/image";
import { StickyScroll } from "./sticky-scroll-reveal";

const content = [
  {
    title: "Visual Indexing and Sequencing Engine (VISE)",
    description:
      "Our core VISE technology breaks down videos frame-by-frame, analyzing visual content with audio context. This creates precise timestamps with detailed descriptions, letting blind users navigate exactly to the moments they need.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        VISE Engine
      </div>
    ),
  },
  {
    title: "Frame Sequencing",
    description:
      "VISE processes continuous frame sequences to understand visual movement and change. This enables powerful search - find exact moments in videos based on actual visual content, not just basic tags or titles.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to bottom right, var(--pink-500), var(--indigo-500))] flex items-center justify-center text-white">
        Frame Sequencing
      </div>
    ),
  },
  {
    title: "Network Processing",
    description:
      "Our decentralized network powers VISE's detailed frame analysis. Each node contributes processing power to create comprehensive visual descriptions, making video content truly accessible.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        Network Processing
      </div>
    ),
  },
  {
    title: "Reward System",
    description:
      "Power the future of video accessibility by running a VISE processing node. Your computational contribution helps analyze frames and create detailed descriptions, earning rewards while making content accessible worldwide.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        Reward System
      </div>
    ),
  },
];

function StickyScroller() {
  return (
    <>
      <div className="flex justify-center w-full bg-[#000011] -mb-40">
        <div className="flex flex-col gap-4 w-full max-w-screen-xl text-white px-8">
          <p className=" w-[15ch] font-atyp text-5xl leading-[60px]">
            A run down on how Crystalrohr works
          </p>
          <p className="w-[50ch] text-sm">
            Transform your videos into GIFs with our fast, easy, and free GIF
            maker. Convert to GIFs in just a few taps.
          </p>
        </div>
      </div>
      <StickyScroll content={content} />
    </>
  );
}
export default StickyScroller;
