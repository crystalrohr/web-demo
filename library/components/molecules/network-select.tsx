"use client";

import Image from "next/image";
import { useState } from "react";

import { NetworkModalContext } from "@/types";

export const networks = [
  { id: "ethereum", name: "Ethereum", color: "bg-purple-100" },
  { id: "base-sepolia", name: "Base Sepolia", color: "bg-blue-500" },
  { id: "sepolia", name: "Sepolia", color: "bg-purple-200" },
  { id: "aptos", name: "Aptos", color: "bg-blue-400" },
  { id: "sui", name: "Sui", color: "bg-yellow-300" },
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
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId | null>(
    null
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {networks
          .filter((network) => !ignoredNetworks.includes(network.id))
          .map((network) => (
            <div
              key={network.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg overflow-hidden aspect-[3/4] ${
                selectedNetwork === network.id ? "ring-2 ring-blue-500" : ""
              } ${network.color}`}
              onClick={() => {
                setSelectedNetwork(network.id);
                updateContext({ network: network.id });
                onNavigate("confirm");
              }}
            >
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-16 h-16 relative mb-4">
                  <Image
                    src={`/supported-networks/${network.id}.webp`}
                    alt={network.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="font-medium text-lg">{network.name}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NetworkSelect;
