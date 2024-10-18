"use client";

import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAptosKeyless } from "@/providers/keyless";

// Define the type for our context
type AptosSurfContextType = {
  client: ReturnType<typeof createSurfClient> | null;
  isInitialized: boolean;
  error: Error | null;
  refreshClient: () => void;
};

// Create the context
const AptosSurfContext = createContext<AptosSurfContextType | undefined>(
  undefined
);

// Props for our provider component
type AptosSurfProviderProps = {
  children: React.ReactNode;
  config?: Partial<AptosConfig>;
};

export const AptosSurfProvider: React.FC<AptosSurfProviderProps> = ({
  children,
  config = {},
}) => {
  const { currentNetwork } = useAptosKeyless();
  const [client, setClient] = useState<ReturnType<
    typeof createSurfClient
  > | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const configRef = useRef(config);

  const initializeClient = useCallback(async () => {
    try {
      const aptosConfig = new AptosConfig({
        network: currentNetwork,
        ...configRef.current,
      });
      const aptos = new Aptos(aptosConfig);

      // If keylessAccount is available, use it to create the client
      const newClient = createSurfClient(aptos);

      setClient(newClient);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to initialize Aptos Surf client")
      );
      setIsInitialized(false);
    }
  }, [currentNetwork]);

  useEffect(() => {
    initializeClient();
  }, [initializeClient]);

  const contextValue = useMemo(
    () => ({
      client,
      isInitialized,
      error,
      refreshClient: initializeClient,
    }),
    [client, isInitialized, error, initializeClient]
  );

  return (
    <AptosSurfContext.Provider value={contextValue}>
      {children}
    </AptosSurfContext.Provider>
  );
};

// Custom hook to use the Aptos Surf context
export const useAptosSurf = () => {
  const context = useContext(AptosSurfContext);
  if (context === undefined) {
    throw new Error("useAptosSurf must be used within an AptosSurfProvider");
  }
  return context;
};
