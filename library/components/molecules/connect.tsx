import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import AdaptiveModal from "@/components/molecules/adaptive-modal";
import NetworkSelect, {
  NetworkId,
  NetworkIds,
} from "@/components/molecules/network-select";
import useStore from "@/store";
import { ConnectorId, NetworkModalContext } from "@/types";
import SignInWithKeyless from "./connector-aptos";
import { WagmiConnection, WagmiConnector } from "./connector-evm";

const Connector = ({
  context,
  onNavigate,
  onClose,
}: {
  context: NetworkModalContext;
  onNavigate: (pageId: string) => void;
  onClose: () => void;
}) => {
  const evm: NetworkId[] = [
    NetworkIds.ethereum,
    NetworkIds.sepolia,
    NetworkIds["base-sepolia"],
  ];

  if (evm.includes(context.network)) {
    return (
      <div className="flex flex-col p-4 gap-4">
        <p>
          {context.network
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </p>

        <WagmiConnector key={context.network} network={context.network} />

        <Button
          onClick={() => {
            onNavigate("select");
          }}
        >
          Back
        </Button>
      </div>
    );
  }

  if (context.network === NetworkIds.aptos) {
    return (
      <div className="flex flex-col p-4 gap-4">
        <p>Aptos</p>
        <SignInWithKeyless />
        <Button onClick={() => onNavigate("select")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 gap-4">
      <p>
        Sorry{" "}
        {context.network
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}{" "}
        is not supported yet
      </p>
      <Button onClick={() => onNavigate("select")}>
        Select another network
      </Button>
    </div>
  );
};

type ConnectionHandlers = {
  [key in ConnectorId]: ({ network }: { network: NetworkId }) => JSX.Element;
};

const connectionHandlers: ConnectionHandlers = {
  wagmi: ({ network }: { network: NetworkId }) => (
    <WagmiConnection network={network} />
  ),
  keyless: () => <SignInWithKeyless />,
  zkLogin: () => <SignInWithKeyless />,
  petra: () => <SignInWithKeyless />,
};

const Connect = () => {
  const { currentConnection } = useStore();
  const { network, connectorId } = currentConnection;

  const [networkContext, setNetworkContext] = useState<NetworkModalContext>({
    ignoredNetworks: [NetworkIds.ethereum],
  } as NetworkModalContext);

  const Connection = useMemo(
    () =>
      connectorId && connectionHandlers[connectorId]
        ? connectionHandlers[connectorId]
        : () => null,
    [connectorId]
  );

  const handleContextChange = useCallback(
    (newContext: NetworkModalContext) => setNetworkContext(newContext),
    []
  );

  return (
    <div className="flex gap-4">
      {network && <Connection network={network} />}
      <AdaptiveModal
        trigger={
          <button className="font-outfit font-[16px] bg-black text-[white] px-6 rounded-[32px] py-3.5">
            {network
              ? network
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : "Connect"}
          </button>
        }
        initialPage="select"
        context={networkContext}
        onContextChange={handleContextChange}
        pages={[
          {
            id: "select",
            title: "Select Network",
            component: NetworkSelect,
          },
          {
            id: "confirm",
            title: "Confirm Connection",
            component: Connector,
          },
        ]}
      />
    </div>
  );
};

export default Connect;
