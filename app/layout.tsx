import type { Metadata } from "next";

import LayoutWrapper from "@/components/template/layout-wrapper";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crystalrohr.vercel.app/"),
  title: "Crystalrohr",
  icons: "/crystalrohr-icon.png",
  description: "Video Auto Caption Service with DePIN Network Participation",
  openGraph: {
    images: "/crystalrohr-opengraph.png",
    url: "https://crystalrohr.vercel.app/",
    title: "Crystalrohr",
    description: "Video Auto Caption Service with DePIN Network Participation",
    siteName: "Crystalrohr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
