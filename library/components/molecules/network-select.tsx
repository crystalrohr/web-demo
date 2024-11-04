import { Button } from "@/components/atoms/button";
import { NetworkModalContext } from "@/types";

export const networks = [
  { id: "ethereum", label: "Ethereum" },
  { id: "base-sepolia", label: "Base Sepolia" },
  { id: "sepolia", label: "Sepolia" },
  { id: "aptos", label: "Aptos" },
  { id: "sui", label: "Sui" },
] as const;

// Create a union type of network IDs
export type NetworkId = (typeof networks)[number]["id"];

// Create an object with network IDs as keys for external access
export const NetworkIds: { [K in NetworkId]: K } = networks.reduce(
  (acc, network) => ({
    ...acc,
    [network.id]: network.id,
  }),
  {} as { [K in NetworkId]: K }
);

const NetworkSelect = ({
  onNavigate,
  updateContext,
  context,
}: {
  onNavigate: (pageId: string) => void;
  updateContext: (newContext: any) => void;
  context: NetworkModalContext;
}) => {
  const ignoredNetworks = context.ignoredNetworks || [];

  return (
    <div className="space-y-4">
      {networks
        .filter((network) => !ignoredNetworks.includes(network.id))
        .map((network) => (
          <Button
            key={network.id}
            onClick={() => {
              updateContext({ network: network.id });
              onNavigate("confirm");
            }}
          >
            {network.label}
          </Button>
        ))}
    </div>
  );
};

export default NetworkSelect;
