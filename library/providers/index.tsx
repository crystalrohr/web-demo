"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import ConnectKitProvider from "./connectkit";
import { AptosKeylessProvider } from "./keyless";
import { AptosSurfProvider } from "./surf";
import { ThemeProvider } from "./theme";
import WagmiProvider from "./wagmi";

const queryClient = new QueryClient();

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <AptosKeylessProvider>
              <AptosSurfProvider>{children}</AptosSurfProvider>
            </AptosKeylessProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default RootProvider;
