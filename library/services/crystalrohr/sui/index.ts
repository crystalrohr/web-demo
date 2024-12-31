import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { createEntryPayload, createViewPayload } from "@thalalabs/surf";

import { IProtocolService, VideoCaptionEvent } from "@/types";
import CRYSTALROHR_PROTOCOL_ABI from "@/types/contracts/move/crystalrohr-protocol";
import ROHR_ABI from "@/types/contracts/move/rohr";

const GRAPHQL_ENDPOINT = "https://api.devnet.aptoslabs.com/v1/graphql";

export class SuiProtocolService implements IProtocolService {
  private client: any;
  private keylessAccount: any;
  private currentNetwork: any;
  private isInitialized: boolean = false;

  constructor() {
    // Note: The actual initialization will happen through hooks
    // This is because we need React context values that can't be accessed in the constructor
  }

  async joinPool() {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "join_pool",
        functionArguments: [],
        typeArguments: [],
      });

      // Simulate the transaction
      const simulationResult = await this.client.simulateTransaction({
        payload,
        sender: this.keylessAccount.accountAddress,
        publicKey: this.keylessAccount.publicKey,
      });

      if (simulationResult.success) {
        const result = await this.client.submitTransaction({
          payload,
          signer: this.keylessAccount,
        });
        return result;
      } else {
        throw new Error("Transaction simulation failed");
      }
    } catch (err) {
      console.error("Error joining pool:", err);
      throw err;
    }
  }

  async stake(amount: number) {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "stake",
        functionArguments: [amount * 100_000_000],
        typeArguments: [],
      });

      const result = await this.client.submitTransaction({
        payload,
        signer: this.keylessAccount,
      });

      return result;
    } catch (err) {
      console.error("Error staking:", err);
      throw err;
    }
  }

  async unstake(amount: number) {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "unstake",
        functionArguments: [amount * 100_000_000],
        typeArguments: [],
      });

      const result = await this.client.submitTransaction({
        payload,
        signer: this.keylessAccount,
      });

      return result;
    } catch (err) {
      console.error("Error unstaking:", err);
      throw err;
    }
  }

  async mintROHR(amount: number) {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(ROHR_ABI, {
        function: "mint",
        functionArguments: [
          this.keylessAccount.accountAddress.toString(),
          amount * 100_000_000,
        ],
        typeArguments: [],
      });

      const result = await this.client.submitTransaction({
        payload,
        signer: this.keylessAccount,
      });

      return result;
    } catch (err) {
      console.error("Error minting ROHR tokens:", err);
      throw err;
    }
  }

  async mintAPT() {
    if (!this.keylessAccount) return;

    try {
      const aptos = new Aptos(
        new AptosConfig({ network: this.currentNetwork })
      );
      await aptos.fundAccount({
        accountAddress: this.keylessAccount.accountAddress.toString(),
        amount: 100_000_000,
      });
      console.log("done!");
    } catch (error) {
      console.error("Error minting APT:", error);
      throw error;
    }
  }

  async claimRewards() {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "claim_rewards",
        functionArguments: [],
        typeArguments: [],
      });

      const result = await this.client.submitTransaction({
        payload,
        signer: this.keylessAccount,
      });

      return result;
    } catch (err) {
      console.error("Error claiming rewards:", err);
      throw err;
    }
  }

  async captionVideo(ipfsHash: string) {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "caption_video",
        functionArguments: [ipfsHash],
        typeArguments: [],
      });

      const simulationResult = await this.client.simulateTransaction({
        payload,
        sender: this.keylessAccount.accountAddress,
        publicKey: this.keylessAccount.publicKey,
      });

      if (simulationResult.success) {
        const result = await this.client.submitTransaction({
          payload,
          signer: this.keylessAccount,
        });
        return result;
      } else {
        throw new Error("Transaction simulation failed");
      }
    } catch (err) {
      console.error("Error captioning video:", err);
      throw err;
    }
  }

  async completeCaptionVideo(caption: string) {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "complete_caption_video",
        functionArguments: [caption],
        typeArguments: [],
      });

      const result = await this.client.submitTransaction({
        payload,
        signer: this.keylessAccount,
      });

      return result;
    } catch (err) {
      console.error("Error completing video caption:", err);
      throw err;
    }
  }

  async getVideoCaptionsByHash(ipfsHash: string): Promise<VideoCaptionEvent[]> {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return [];

    try {
      const { address: moduleAddress, name } = CRYSTALROHR_PROTOCOL_ABI;
      const userAddress = this.keylessAccount?.accountAddress.toString();

      const userCaptionQuery = `
        query MyQuery {
          events(
            where: {
              type: {_eq: "${moduleAddress}::${name}::VideoCaptionCompleted"},
              account_address: {_eq: "0x0000000000000000000000000000000000000000000000000000000000000000"},
              data: {_contains: {ipfs_hash: "${ipfsHash}", user_address: "${userAddress}"}}
            }
            order_by: {transaction_block_height: desc}
          ) {
            data
          }
        }
      `;

      const response = await this.fetchGraphQLData(
        GRAPHQL_ENDPOINT,
        userCaptionQuery
      );
      return response.data.events.map(
        (event: any) => event.data
      ) as VideoCaptionEvent[];
    } catch (err) {
      console.error("Error getting video caption:", err);
      throw err;
    }
  }

  async pollForVideoCaptions(
    ipfsHash: string,
    maxAttempts: number = 300,
    interval: number = 10000
  ): Promise<VideoCaptionEvent[]> {
    let attempts = 0;

    const poll = async (): Promise<VideoCaptionEvent[]> => {
      attempts++;

      try {
        const result = await this.getVideoCaptionsByHash(ipfsHash);

        if (result.length > 0) {
          return result;
        } else if (attempts < maxAttempts) {
          console.log(
            `Attempt ${attempts}: No captions found. Retrying in ${
              interval / 1000
            } seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, interval));
          return poll();
        } else {
          console.log(
            `Max attempts (${maxAttempts}) reached. No captions found.`
          );
          return [];
        }
      } catch (error) {
        console.error(`Error in attempt ${attempts}:`, error);
        if (attempts < maxAttempts) {
          console.log(`Retrying in ${interval / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, interval));
          return poll();
        } else {
          throw new Error(
            `Failed to fetch video captions after ${maxAttempts} attempts`
          );
        }
      }
    };

    return poll();
  }

  async getLastVideoCaption(userAddress: `0x{string}`) {
    if (!this.client || !this.isInitialized) return;

    try {
      const payload = createViewPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "get_video_caption",
        functionArguments: [userAddress],
        typeArguments: [],
      });

      const result = await this.client.view({ payload });
      return result;
    } catch (err) {
      console.error("Error getting video caption:", err);
      throw err;
    }
  }

  async getIncompleteVideoCaptionTasks(): Promise<
    Omit<VideoCaptionEvent, "caption">[]
  > {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return [];

    try {
      const { address: moduleAddress, name } = CRYSTALROHR_PROTOCOL_ABI;
      const nodeAddress = this.keylessAccount.accountAddress.toString();

      const requestedQuery = `
        query {
          events(
            where: {
              type: {_eq: "${moduleAddress}::${name}::VideoCaptionRequested"},
              account_address: {_eq: "0x0000000000000000000000000000000000000000000000000000000000000000"},
              data: {_contains: {node_address: "${nodeAddress}"}}
            }
            order_by: {transaction_block_height: desc}
          ) {
            data
          }
        }
      `;

      const completedQuery = `
        query {
          events(
            where: {
              type: {_eq: "${moduleAddress}::${name}::VideoCaptionCompleted"},
              account_address: {_eq: "0x0000000000000000000000000000000000000000000000000000000000000000"},
              data: {_contains: {node_address: "${nodeAddress}"}}
            }
            order_by: {transaction_block_height: desc}
          ) {
            data
          }
        }
      `;

      const [requestedResponse, completedResponse] = await Promise.all([
        this.fetchGraphQLData(GRAPHQL_ENDPOINT, requestedQuery),
        this.fetchGraphQLData(GRAPHQL_ENDPOINT, completedQuery),
      ]);

      const requestedEvents: Omit<VideoCaptionEvent, "caption">[] =
        requestedResponse.data.events.map((event: any) => event.data);
      const completedEvents: VideoCaptionEvent[] =
        completedResponse.data.events.map((event: any) => event.data);

      const requestedCounts = new Map<string, number>();
      const completedCounts = new Map<string, number>();

      requestedEvents.forEach((event) => {
        const key = `${event.user_address}-${event.ipfs_hash}`;
        requestedCounts.set(key, (requestedCounts.get(key) || 0) + 1);
      });

      completedEvents.forEach((event) => {
        const key = `${event.user_address}-${event.ipfs_hash}`;
        completedCounts.set(key, (completedCounts.get(key) || 0) + 1);
      });

      const incompleteTasks: Omit<VideoCaptionEvent, "caption">[] = [];

      requestedEvents.forEach((event) => {
        const key = `${event.user_address}-${event.ipfs_hash}`;
        let requestedCount = requestedCounts.get(key) || 0;
        const completedCount = completedCounts.get(key) || 0;

        if (requestedCount > completedCount) {
          incompleteTasks.push(event);
          requestedCounts.set(key, requestedCount - 1);
        }
      });

      return incompleteTasks;
    } catch (err) {
      console.error("Error getting incomplete video caption tasks:", err);
      throw err;
    }
  }

  async isValidStaker(nodeAddress: `0x{string}`): Promise<boolean> {
    if (!this.client || !this.isInitialized) return false;

    try {
      const payload = createViewPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "valid_staker",
        functionArguments: [nodeAddress],
        typeArguments: [],
      });

      const result = await this.client.view({ payload });
      return result;
    } catch (err) {
      console.error("Error checking valid staker:", err);
      throw err;
    }
  }

  async getStakedAmount(nodeAddress: `0x{string}`): Promise<number> {
    if (!this.client || !this.isInitialized || !this.keylessAccount) return 0;

    try {
      const payload = createViewPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "staked_amount",
        functionArguments: [this.keylessAccount.accountAddress.toString()],
        typeArguments: [],
      });

      const result = await this.client.view({ payload });
      return result[0];
    } catch (err) {
      console.error("Error getting staked amount:", err);
      throw err;
    }
  }

  private async fetchGraphQLData(endpoint: string, query: string) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return res.json();
  }

  // Method to initialize the service with React hooks context
  initialize(
    client: any,
    keylessAccount: any,
    currentNetwork: any,
    isInitialized: boolean
  ) {
    this.client = client;
    this.keylessAccount = keylessAccount;
    this.currentNetwork = currentNetwork;
    this.isInitialized = isInitialized;
  }
}
