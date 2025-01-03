import { getDefaultConfig } from "connectkit";
import { createConfig, http, webSocket } from "wagmi";
import { anvil, sepolia, baseSepolia, bscTestnet } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    appName: "Farlensflow",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [sepolia, baseSepolia, bscTestnet, anvil],
    multiInjectedProviderDiscovery: true,
    transports: {
      [sepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ),
      [baseSepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ),
      [bscTestnet.id]: webSocket("wss://bsc-testnet-rpc.publicnode.com"),
      [anvil.id]: http(),
    },
  }),
);
