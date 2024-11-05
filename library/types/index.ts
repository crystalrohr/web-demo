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

  // Video caption related functions
  captionVideo(ipfsHash: string): Promise<any>;
  completeCaptionVideo(caption: string): Promise<any>;
  getVideoCaptionsByHash(ipfsHash: string): Promise<any>;
  getLastVideoCaption(userAddress: `0x${string}`): Promise<any>;
  getIncompleteVideoCaptionTasks(): Promise<any>;

  // Utility functions
  validStaker(nodeAddress: `0x${string}`): Promise<boolean>;
  stakedAmount(): Promise<number>;
}

export type VideoCaptionEvent = {
  user_address: string;
  ipfs_hash: string;
  node_address: string;
  caption: string;
};

export type NetworkModalContext = {
  network: NetworkId;
  ignoredNetworks?: NetworkId[];
};

export type ConnectorId = "wagmi" | "keyless" | "zkLogin" | "petra";

export interface ConnectionInfo {
  network: NetworkId | null;
  connectorId: ConnectorId | null;
  address: string | null;
}
