import { NetworkId } from "@/components/molecules/network-select";

export enum ChainType {
  APTOS = "APTOS",
  ALGORAND = "ALGORAND",
  EVM = "EVM", // For Ethereum and other EVM chains
}

export interface IProtocolService {
  // Core staking functions
  joinPool(): Promise<any>;
  stake(amount: number): Promise<any>;
  unstake(amount: number): Promise<any>;
  claimRewards(): Promise<any>;

  // Minting functions
  mintROHR(amount: number, address: `0x${string}`): Promise<any>;

  // Video caption related functions
  captionVideo(ipfsHash: string): Promise<any>;
  completeCaptionVideo(caption: string): Promise<any>;
  getVideoCaptionsByHash(ipfsHash: string): Promise<any>;
  getLastVideoCaption(userAddress: `0x${string}`): Promise<any>;
  getIncompleteVideoCaptionTasks(
    nodeAddress: `0x${string}`
  ): Promise<Omit<VideoCaptionEvent, "caption">[]>;

  // Utility functions
  isValidStaker(nodeAddress: `0x${string}`): Promise<boolean>;
  getStakedAmount(nodeAddress: `0x${string}`): Promise<number>;
}

export type VideoCaptionEvent = {
  user_address: string;
  ipfs_hash: string;
  node_address: string;
  caption: string;
};

export type NetworkModalContext = {
  name: string;
  network: NetworkId;
  ignoredNetworks?: NetworkId[];
};

export type ConnectorId = "wagmi" | "keyless" | "zkLogin" | "petra";

export interface ConnectionInfo {
  network: NetworkId | null;
  connectorId: ConnectorId | null;
  address: string | null;
}

export interface ConnectorProps {
  network: NetworkId;
}
