import { Button } from "@/components/atoms/button";
import { KeylessConnector } from "@/components/molecules/connector-aptos";
import { WagmiConnector } from "@/components/molecules/connector-evm";
import {
  networks,
  NetworkId,
  NetworkIds,
} from "@/components/molecules/network-select";
import { NetworkModalContext } from "@/types";
import { formatNetworkName } from "@/utils";

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
    NetworkIds.anvil,
    NetworkIds["base-sepolia"],
    NetworkIds["binance-smart-chain-testnet"],
  ];

  if (evm.includes(context.network)) {
    return (
      <div className="flex flex-col p-4 gap-4">
        <p>{formatNetworkName(context.network)}</p>

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
        <KeylessConnector network={context.network} />
        <Button onClick={() => onNavigate("select")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 gap-4">
      <p>Sorry {formatNetworkName(context.network)} is not supported yet</p>
      <Button onClick={() => onNavigate("select")}>
        Select another network
      </Button>
    </div>
  );
};

export default Connector;
