import { useCallback, useMemo, useState } from "react";

import AdaptiveModal from "@/components/molecules/adaptive-modal";
import { KeylessConnection } from "@/components/molecules/connector-aptos";
import { WagmiConnection } from "@/components/molecules/connector-evm";
import Connector from "@/components/molecules/connector";
import NetworkSelect, {
  NetworkId,
  NetworkIds,
} from "@/components/molecules/network-select";
import { useConnectorHelper } from "@/hooks/use-connector-helper";
import { ConnectorId, NetworkModalContext } from "@/types";
import { formatNetworkName } from "@/utils";

type ConnectionHandlers = {
  [key in ConnectorId]: ({ network }: { network: NetworkId }) => JSX.Element;
};

const Connect = () => {
  const { currentConnection } = useConnectorHelper(true);
  const { network, connectorId } = currentConnection;

  const [networkContext, setNetworkContext] = useState<NetworkModalContext>({
    ignoredNetworks: [NetworkIds.ethereum],
  } as NetworkModalContext);

  const Connection = useMemo(() => {
    const handlers: ConnectionHandlers = {
      wagmi: ({ network }: { network: NetworkId }) => (
        <WagmiConnection network={network} />
      ),
      keyless: () => <KeylessConnection />,
      zkLogin: () => <div />,
      petra: () => <div />,
    };

    return connectorId && handlers[connectorId]
      ? handlers[connectorId]
      : () => null;
  }, [connectorId]);

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
            {network ? formatNetworkName(network) : "Connect"}
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
