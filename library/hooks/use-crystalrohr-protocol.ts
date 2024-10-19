import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { createEntryPayload, createViewPayload } from "@thalalabs/surf";
import { useCallback } from "react";

import { useAptosKeyless } from "@/providers/keyless";
import { useAptosSurf } from "@/providers/surf";
import { VideoCaptionEvent } from "@/types";
import CRYSTALROHR_PROTOCOL_ABI from "@/types/move/crystalrohr-protocol";
import ROHR_ABI from "@/types/move/rohr";

const GRAPHQL_ENDPOINT = "https://api.devnet.aptoslabs.com/v1/graphql";

export const useCrystalRohrProtocol = () => {
  const { client, isInitialized } = useAptosSurf();
  const { keylessAccount, currentNetwork } = useAptosKeyless();

  const joinPool = useCallback(async () => {
    if (!client || !isInitialized || !keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "join_pool",
        functionArguments: [],
        typeArguments: [],
      });

      // Simulate the transaction
      const simulationResult = await client.simulateTransaction({
        payload,
        sender: keylessAccount.accountAddress,
        publicKey: keylessAccount.publicKey,
      });

      console.log(simulationResult);

      // Check if simulation was successful
      if (simulationResult.success) {
        // If simulation was successful, submit the actual transaction
        const result = await client.submitTransaction({
          payload,
          signer: keylessAccount,
        });
        return result;
      } else {
        throw new Error("Transaction simulation failed");
      }
    } catch (err) {
      console.error("Error joining pool:", err);
      throw err;
    }
  }, [client, isInitialized, keylessAccount]);

  const stake = useCallback(
    async (amount: number) => {
      if (!client || !isInitialized || !keylessAccount) return;

      try {
        const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
          function: "stake",
          functionArguments: [amount * 100_000_000],
          typeArguments: [],
        });

        const result = await client.submitTransaction({
          payload,
          signer: keylessAccount,
        });

        return result;
      } catch (err) {
        console.error("Error staking:", err);
        throw err;
      }
    },
    [client, isInitialized, keylessAccount]
  );

  const unstake = useCallback(
    async (amount: number) => {
      if (!client || !isInitialized || !keylessAccount) return;

      try {
        const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
          function: "unstake",
          functionArguments: [amount * 100_000_000],
          typeArguments: [],
        });

        const result = await client.submitTransaction({
          payload,
          signer: keylessAccount,
        });

        return result;
      } catch (err) {
        console.error("Error unstaking:", err);
        throw err;
      }
    },
    [client, isInitialized, keylessAccount]
  );

  const mintROHR = useCallback(
    async (amount: number) => {
      if (!client || !isInitialized || !keylessAccount) return;

      try {
        const payload = createEntryPayload(ROHR_ABI, {
          function: "mint",
          functionArguments: [
            keylessAccount.accountAddress.toString(),
            amount * 100_000_000,
          ],
          typeArguments: [],
        });

        const result = await client.submitTransaction({
          payload,
          signer: keylessAccount,
        });

        return result;
      } catch (err) {
        console.error("Error minting ROHR tokens:", err);
        throw err;
      }
    },
    [client, isInitialized, keylessAccount]
  );

  const mintAPT = useCallback(async () => {
    if (!keylessAccount) return;

    try {
      const aptos = new Aptos(new AptosConfig({ network: currentNetwork }));
      await aptos.fundAccount({
        accountAddress: keylessAccount.accountAddress.toString(),
        amount: 100_000_000,
      });
      console.log("done!");
    } catch (error) {
      console.error("Error minting APT:", error);
      throw error;
    }
  }, [keylessAccount, currentNetwork]);

  const claimRewards = useCallback(async () => {
    if (!client || !isInitialized || !keylessAccount) return;

    try {
      const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "claim_rewards",
        functionArguments: [],
        typeArguments: [],
      });

      const result = await client.submitTransaction({
        payload,
        signer: keylessAccount,
      });

      return result;
    } catch (err) {
      console.error("Error claiming rewards:", err);
      throw err;
    }
  }, [client, isInitialized, keylessAccount]);

  const captionVideo = useCallback(
    async (ipfsHash: string) => {
      if (!client || !isInitialized || !keylessAccount) return;

      try {
        const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
          function: "caption_video",
          functionArguments: [ipfsHash],
          typeArguments: [],
        });

        const simulationResult = await client.simulateTransaction({
          payload,
          sender: keylessAccount.accountAddress,
          publicKey: keylessAccount.publicKey,
        });
        if (simulationResult.success) {
          const result = await client.submitTransaction({
            payload,
            signer: keylessAccount,
          });

          return result;
        } else {
          throw new Error("Transaction simulation failed");
        }
      } catch (err) {
        console.error("Error captioning video:", err);
        throw err;
      }
    },
    [client, isInitialized, keylessAccount]
  );

  const completeCaptionVideo = useCallback(
    async (caption: string) => {
      if (!client || !isInitialized || !keylessAccount) return;

      try {
        const payload = createEntryPayload(CRYSTALROHR_PROTOCOL_ABI, {
          function: "complete_caption_video",
          functionArguments: [caption],
          typeArguments: [],
        });

        const result = await client.submitTransaction({
          payload,
          signer: keylessAccount,
        });

        return result;
      } catch (err) {
        console.error("Error completing video caption:", err);
        throw err;
      }
    },
    [client, isInitialized, keylessAccount]
  );

  const getVideoCaptionsByHash = useCallback(
    async (ipfsHash: string): Promise<VideoCaptionEvent[]> => {
      if (!client || !isInitialized || !keylessAccount) return [];

      try {
        const { address: moduleAddress, name } = CRYSTALROHR_PROTOCOL_ABI;
        const userAddress = keylessAccount?.accountAddress.toString();

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

        const response = await fetchGraphQLData(
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
    },
    [
      client,
      isInitialized,
      keylessAccount,
      CRYSTALROHR_PROTOCOL_ABI,
      GRAPHQL_ENDPOINT,
    ]
  );

  const pollForVideoCaptions = async (
    ipfsHash: string,
    maxAttempts: number = 300,
    interval: number = 10000
  ): Promise<VideoCaptionEvent[]> => {
    let attempts = 0;

    const poll = async (): Promise<VideoCaptionEvent[]> => {
      attempts++;

      try {
        const result = await getVideoCaptionsByHash(ipfsHash);

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
  };

  const getLastVideoCaption = useCallback(
    async (userAddress: `0x${string}`) => {
      if (!client || !isInitialized) return;

      try {
        const payload = createViewPayload(CRYSTALROHR_PROTOCOL_ABI, {
          function: "get_video_caption",
          functionArguments: [userAddress],
          typeArguments: [],
        });

        const result = await client.view({ payload });
        return result;
      } catch (err) {
        console.error("Error getting video caption:", err);
        throw err;
      }
    },
    [client, isInitialized]
  );

  const getIncompleteVideoCaptionTasksDeps = [
    client,
    isInitialized,
    keylessAccount,
    CRYSTALROHR_PROTOCOL_ABI,
    fetchGraphQLData,
    GRAPHQL_ENDPOINT,
  ];

  const getIncompleteVideoCaptionTasks = useCallback(
    async (): Promise<Omit<VideoCaptionEvent, "caption">[]> => {
      console.log(client, isInitialized, keylessAccount);
      if (!client || !isInitialized || !keylessAccount) return [];

      try {
        const { address: moduleAddress, name } = CRYSTALROHR_PROTOCOL_ABI;
        const nodeAddress = keylessAccount.accountAddress.toString();

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

        const requestedResponse = await fetchGraphQLData(
          GRAPHQL_ENDPOINT,
          requestedQuery
        );
        const requestedEvents: Omit<VideoCaptionEvent, "caption">[] =
          requestedResponse.data.events.map((event: any) => event.data);

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

        const completedResponse = await fetchGraphQLData(
          GRAPHQL_ENDPOINT,
          completedQuery
        );
        const completedEvents: VideoCaptionEvent[] =
          completedResponse.data.events.map((event: any) => event.data);

        // Filter out completed captions to get incomplete tasks
        const incompleteTasks = requestedEvents.filter(
          (requested) =>
            !completedEvents.some(
              (completed) =>
                completed.user_address === requested.user_address &&
                completed.ipfs_hash === requested.ipfs_hash
            )
        );

        return incompleteTasks;
      } catch (err) {
        console.error("Error getting incomplete video caption tasks:", err);
        throw err;
      }
    },
    getIncompleteVideoCaptionTasksDeps
  );

  const validStaker = useCallback(
    async (nodeAddress: `0x${string}`) => {
      if (!client || !isInitialized) return;

      try {
        const payload = createViewPayload(CRYSTALROHR_PROTOCOL_ABI, {
          function: "valid_staker",
          functionArguments: [nodeAddress],
          typeArguments: [],
        });

        const result = await client.view({ payload });
        return result;
      } catch (err) {
        console.error("Error checking valid staker:", err);
        throw err;
      }
    },
    [client, isInitialized]
  );

  const stakedAmount = useCallback(async () => {
    if (!client || !isInitialized || !keylessAccount) return;

    try {
      const payload = createViewPayload(CRYSTALROHR_PROTOCOL_ABI, {
        function: "staked_amount",
        functionArguments: [keylessAccount.accountAddress.toString()],
        typeArguments: [],
      });

      const result = await client.view({ payload });
      return result[0];
    } catch (err) {
      console.error("Error getting staked amount:", err);
      throw err;
    }
  }, [client, isInitialized, keylessAccount]);

  return {
    joinPool,
    stake,
    unstake,
    mintROHR,
    mintAPT,
    claimRewards,
    captionVideo,
    completeCaptionVideo,
    getVideoCaptionsByHash,
    pollForVideoCaptions,
    getLastVideoCaption,
    getIncompleteVideoCaptionTasks,
    getIncompleteVideoCaptionTasksDeps,
    validStaker,
    stakedAmount,
  };
};

async function fetchGraphQLData(endpoint: string, query: string) {
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
