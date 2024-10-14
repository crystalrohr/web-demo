"use client";

import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";

import { Toaster } from "@/components/atoms/sonner";
import RootProvider from "@/providers";
import { cn } from "@/utils";

const inter = Inter({ subsets: ["latin"], preload: true });
const outfit = Outfit({
  subsets: ["latin"],
  preload: true,
  weight: "600",
  variable: "--font-outfit",
  display: "swap",
});
const atyp = localFont({
  src: [
    {
      path: "../public/fonts/AtypDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-atyp",
  preload: true,
});

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={cn(inter.className, outfit.variable, atyp.variable)}>
        <RootProvider>{children}</RootProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default LayoutWrapper;
