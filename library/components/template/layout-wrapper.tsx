"use client";

import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";

import { Toaster } from "@/components/atoms/sonner";
import RootProvider from "@/providers";
import { cn } from "@/utils";
import Navbar from "../organisms/nav-bar";

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
      path: "../../../public/fonts/AtypDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-atyp",
  preload: true,
});

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Check if the current pathname matches any of the path patterns
  // Define an array of path patterns
  // e.g /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/somewhere\/[a-zA-Z0-9_-]+$/
  const pathPatterns = [/^\/console+$/, /^\/console\/.*$/, /^\/redirect+$/];

  const isPathMatched = pathPatterns.some((pattern) => pattern.test(pathname));

  return (
    <html lang="en">
      <body className={cn(inter.className, outfit.variable, atyp.variable)}>
        <RootProvider>
          <>
            {isPathMatched ? (
              <>{children}</>
            ) : (
              <>
                <Navbar />
                {children}
              </>
            )}
          </>
        </RootProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default LayoutWrapper;
