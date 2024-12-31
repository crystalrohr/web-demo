import { config } from "@/providers/wagmi/config";
import { simulateContract, writeContract } from "@wagmi/core";
import { Address, parseUnits } from "viem";
import { readContract } from "wagmi/actions";
import ky from "ky";

import { IProtocolService, VideoCaptionEvent } from "@/types";
import crystalrohrProtocol from "@/types/contracts/evm/crystalrohr-protocol";
import crystalrohrStaking from "@/types/contracts/evm/crystalrohr-staking";
import rohr from "@/types/contracts/evm/rohr";

const CRYSTALROHR_PROTOCOL_ABI = crystalrohrProtocol.abi;
const CRYSTALROHR_STAKING_ABI = crystalrohrStaking.abi;
const ROHR_ABI = rohr.abi;

const CRYSTALROHR_PROTOCOL_ADDRESS = crystalrohrProtocol.address;
const CRYSTALROHR_STAKING_ADDRESS = crystalrohrStaking.address;
const ROHR_ADDRESS = rohr.address;

export class EVMProtocolService implements IProtocolService {
  async joinPool() {
    try {
      const { request } = await simulateContract(config, {
        abi: CRYSTALROHR_PROTOCOL_ABI,
        address: CRYSTALROHR_PROTOCOL_ADDRESS,
        functionName: "joinPool",
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error joining pool:", err);
      throw err;
    }
  }

  async stake(amount: number) {
    try {
      const { request } = await simulateContract(config, {
        abi: CRYSTALROHR_PROTOCOL_ABI,
        address: CRYSTALROHR_PROTOCOL_ADDRESS,
        functionName: "stake",
        args: [parseUnits(amount.toString(), 18)],
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error staking:", err);
      throw err;
    }
  }

  async unstake(amount: number) {
    try {
      const { request } = await simulateContract(config, {
        abi: CRYSTALROHR_PROTOCOL_ABI,
        address: CRYSTALROHR_PROTOCOL_ADDRESS,
        functionName: "unstake",
        args: [parseUnits(amount.toString(), 18)],
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error unstaking:", err);
      throw err;
    }
  }

  async claimRewards() {
    try {
      const { request } = await simulateContract(config, {
        abi: CRYSTALROHR_PROTOCOL_ABI,
        address: CRYSTALROHR_PROTOCOL_ADDRESS,
        functionName: "claimRewards",
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error claiming rewards:", err);
      throw err;
    }
  }

  async mintROHR(amount: number, recipient: Address) {
    try {
      const { request } = await simulateContract(config, {
        abi: ROHR_ABI,
        address: ROHR_ADDRESS,
        functionName: "mint",
        args: [recipient, parseUnits(amount.toString(), 18)],
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error minting ROHR:", err);
      throw err;
    }
  }

  async captionVideo(ipfsHash: string) {
    try {
      const { request } = await simulateContract(config, {
        abi: CRYSTALROHR_PROTOCOL_ABI,
        address: CRYSTALROHR_PROTOCOL_ADDRESS,
        functionName: "captionVideo",
        args: [ipfsHash],
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error captioning video:", err);
      throw err;
    }
  }

  async completeCaptionVideo(caption: string) {
    try {
      const { request } = await simulateContract(config, {
        abi: CRYSTALROHR_PROTOCOL_ABI,
        address: CRYSTALROHR_PROTOCOL_ADDRESS,
        functionName: "completeCaptionVideo",
        args: [caption],
      });
      return writeContract(config, request);
    } catch (err) {
      console.error("Error completing caption:", err);
      throw err;
    }
  }

  async getVideoCaptionsByHash(ipfsHash: string): Promise<VideoCaptionEvent[]> {
    try {
      const query = {
        query: `
        query VideoCaptions($ipfsHash: String!) {
        videoCaptionCompleteds(
          where: { ipfsHash: $ipfsHash }
          orderBy: blockNumber
          orderDirection: desc
        ) {
          id
          ipfsHash
          userAddress
          nodeAddress
          caption
          blockNumber
          timestamp
        }
        }
      `,
        variables: { ipfsHash },
      };

      const response: {
        data: { videoCaptionCompleteds: VideoCaptionEvent[] };
      } = await ky
        .post("YOUR_GRAPHQL_ENDPOINT", {
          json: query,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .json();

      return response.data.videoCaptionCompleteds;
    } catch (err) {
      console.error("Error fetching captions:", err);
      throw err;
    }
  }

  async getLastVideoCaption(userAddress: `0x${string}`): Promise<any> {
    // TODO: Implement
  }

  async getIncompleteVideoCaptionTasks(): Promise<any> {
    // TODO: Implement
  }

  async isValidStaker(nodeAddress: Address): Promise<boolean> {
    try {
      return await readContract(config, {
        address: CRYSTALROHR_STAKING_ADDRESS,
        abi: CRYSTALROHR_STAKING_ABI,
        functionName: "isValidStaker",
        args: [nodeAddress],
      });
    } catch (err) {
      console.error("Error checking staker:", err);
      throw err;
    }
  }

  async getStakedAmount(nodeAddress: Address): Promise<number> {
    try {
      const stakedAmount = await readContract(config, {
        address: CRYSTALROHR_STAKING_ADDRESS,
        abi: CRYSTALROHR_STAKING_ABI,
        functionName: "getStakedAmount",
        args: [nodeAddress],
      });

      return Number(stakedAmount);
    } catch (err) {
      console.error("Error getting staked amount:", err);
      throw err;
    }
  }
}
