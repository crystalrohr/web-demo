import { useEffect, useRef } from "react";

import { NetworkId } from "@/components/molecules/network-select";
import useStore from "@/store";
import { ConnectorId } from "@/types";

type DisconnectHandlers = {
  [key in ConnectorId]: (provider: any) => Promise<void>;
};

type ReconnectionHandlers = {
  [key in ConnectorId]: () => Promise<boolean>;
};

export const RECONNECTION_TIMEOUT = 10_000; // 10 seconds timeout

const disconnectHandlers: DisconnectHandlers = {
  wagmi: async (provider: any) => {
    try {
      await provider?.logout?.();
    } catch (error) {
      console.error("Error disconnecting Wagmi:", error);
    }
  },
  keyless: async (provider: any) => {
    try {
      await provider?.disconnect?.();
    } catch (error) {
      console.error("Error disconnecting Keyless:", error);
    }
  },
  zkLogin: async (provider: any) => {
    try {
      await provider?.disconnect?.();
    } catch (error) {
      console.error("Error disconnecting zkLogin:", error);
    }
  },
  petra: async (provider: any) => {
    try {
      await provider?.disconnect?.();
    } catch (error) {
      console.error("Error disconnecting Petra:", error);
    }
  },
};

// TODO: Pass in providers and make, extract the "check again's" into a function.
const reconnectionHandlers: ReconnectionHandlers = {
  wagmi: async () => {
    try {
      const startTime = Date.now();

      // Check if wallet is still connected, if not available, check again
      while (Date.now() - startTime < RECONNECTION_TIMEOUT - 1000) {
        const isConnected = window?.ethereum?.selectedAddress;

        if (isConnected) return true;

        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }

      return false;
    } catch {
      return false;
    }
  },
  keyless: async () => {
    try {
      const startTime = Date.now();

      // If storedJwt or storedEkp—wallet creation keys—are not available on login, check again
      while (Date.now() - startTime < RECONNECTION_TIMEOUT - 1000) {
        const storedJwt = localStorage.getItem("@aptos/jwt");
        const storedEkp = localStorage.getItem("@aptos/ephemeral_key_pair");

        if (storedJwt && storedEkp) return true;

        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }

      return false;
    } catch {
      return false;
    }
  },
  zkLogin: async () => {
    return false; // Implement zkLogin reconnection check
  },
  petra: async () => {
    return false; // Implement petra reconnection check
  },
};

export const useConnectorHelper = (verifyOnMount: boolean = false) => {
  const { currentConnection, setCurrentConnection, clearCurrentConnection } =
    useStore();
  const connectionStateRef = useRef<{
    network: NetworkId;
    connectorId: ConnectorId;
    address: string;
  } | null>(null);
  const hasVerifiedRef = useRef(false);

  // Store initial connection state in ref
  useEffect(() => {
    if (currentConnection.network && currentConnection.connectorId) {
      connectionStateRef.current = {
        network: currentConnection.network,
        connectorId: currentConnection.connectorId,
        address: currentConnection.address || "",
      };
    }
  }, [currentConnection]);

  // Verify connection on mount
  useEffect(() => {
    // Store current values before async operations
    const initialConnection = currentConnection;
    const { network, connectorId } = initialConnection;

    if (!verifyOnMount || hasVerifiedRef.current || !network || !connectorId)
      return;
    hasVerifiedRef.current = true;

    const verifyConnection = async () => {
      console.log("Verifying connection...");
      console.log("Connection state:", initialConnection);

      const reconnectionHandler = reconnectionHandlers[connectorId];

      const d = await reconnectionHandler();

      console.log("Recconection State!!!!!!!:", d);

      if (!reconnectionHandler) {
        console.warn(
          `No reconnection handler found for connector: ${connectorId}`
        );
        return;
      }

      try {
        const reconnectionTimeout = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Reconnection timeout")),
            RECONNECTION_TIMEOUT
          )
        );

        console.log("Attempting reconnection...");
        const reconnectionAttempt = reconnectionHandler();
        const isConnected = await Promise.race([
          reconnectionAttempt,
          reconnectionTimeout,
        ]);

        if (!isConnected) {
          console.log("Disconnecting current connection...");
          clearCurrentConnection();
        } else {
          console.log("Reconnection successful!");
        }
      } catch (error) {
        console.warn("Connection verification failed:", error);
        console.log("Disconnecting current connection due to error...");
        clearCurrentConnection();
      }
    };

    verifyConnection();
  }, [clearCurrentConnection, verifyOnMount, currentConnection]);

  const disconnectPrevious = async (provider?: any) => {
    const { network, connectorId } = currentConnection;

    if (network && connectorId && provider) {
      const disconnectHandler = disconnectHandlers[connectorId];
      if (disconnectHandler) {
        await disconnectHandler(provider);
      } else {
        console.warn(
          `No disconnect handler found for connector: ${connectorId}`
        );
      }
    }
  };

  const handleNewConnection = async (
    network: NetworkId,
    connectorId: ConnectorId,
    address: string,
    previousProvider?: any
  ) => {
    await disconnectPrevious(previousProvider);
    setCurrentConnection(network, connectorId, address);
  };

  const disconnectCurrent = async (provider?: any) => {
    await disconnectPrevious(provider);
    clearCurrentConnection();
  };

  return {
    currentConnection,
    handleNewConnection,
    disconnectCurrent,
  };
};
