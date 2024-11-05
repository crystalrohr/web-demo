import { NetworkId } from "@/components/molecules/network-select";
import useStore from "@/store";
import { ConnectorId } from "@/types";

type DisconnectHandlers = {
  [key in ConnectorId]: (provider: any) => Promise<void>;
};

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

export const useConnectorHelper = () => {
  const { currentConnection, setCurrentConnection, clearCurrentConnection } =
    useStore();

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
