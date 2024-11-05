import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NetworkId } from "@/components/molecules/network-select";
import { ConnectionInfo, ConnectorId } from "@/types";

type State = {
  currentConnection: ConnectionInfo;
};

type Actions = {
  setCurrentConnection: (
    network: NetworkId,
    connectorId: ConnectorId,
    address: string
  ) => void;
  clearCurrentConnection: () => void;
};

export type ConnectorSlice = State & Actions;

export default persist(
  immer<State & Actions>((set) => ({
    currentConnection: {
      network: null,
      connectorId: null,
      address: null,
    },

    setCurrentConnection: (network, connectorId, address) =>
      set((state) => {
        state.currentConnection = { network, connectorId, address };
      }),

    clearCurrentConnection: () =>
      set((state) => {
        state.currentConnection = {
          network: null,
          connectorId: null,
          address: null,
        };
      }),
  })),
  {
    name: "connector-storage",
    storage: createJSONStorage(() => localStorage),
  }
);
