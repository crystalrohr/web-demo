import { useCallback, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

import { useConnectorHelper } from "@/hooks/use-connector-helper";
import { useAptosKeyless } from "@/providers/keyless";
import { useAptosSurf } from "@/providers/surf";
import { AptosProtocolService } from "@/services/crystalrohr/aptos";
import { EVMProtocolService } from "@/services/crystalrohr/evm";
import { SuiProtocolService } from "@/services/crystalrohr/sui";
import { IProtocolService } from "@/types";

export const useCrystalRohrProtocol = () => {
  const [service, setService] = useState<IProtocolService | null>(null);
  const [nodeAddress, setWalletAddress] = useState<`0x${string}`>();

  const { currentConnection } = useConnectorHelper();
  const { connectorId } = currentConnection;
  const { data: walletClient } = useWalletClient();
  const { client: aptosClient, isInitialized } = useAptosSurf();
  const { keylessAccount, currentNetwork } = useAptosKeyless();
  const account = useAccount();

  useEffect(() => {
    switch (connectorId) {
      case "wagmi":
        setService(new EVMProtocolService());
        setWalletAddress(account.address);
        break;
      case "keyless":
        if (aptosClient && keylessAccount) {
          const aptosService = new AptosProtocolService();
          aptosService.initialize(
            aptosClient,
            keylessAccount,
            currentNetwork,
            isInitialized
          );
          setService(aptosService);
        } else {
          throw new Error("No aptosClient or keylessAccount not available");
        }
        break;
      case "zkLogin":
        setService(new SuiProtocolService());
        break;
      default:
        setService(null);
        setWalletAddress(undefined);
    }
  }, [
    connectorId,
    aptosClient,
    keylessAccount,
    currentNetwork,
    isInitialized,
    walletClient,
  ]);

  // Helper function to ensure service exists
  const withService = useCallback(
    <T>(
      operation: (
        service: IProtocolService,
        nodeAddress: `0x${string}`
      ) => Promise<T>
    ) => {
      if (!service) throw new Error("No blockchain service available");
      if (!nodeAddress) throw new Error("No node address not available");
      return operation(service, nodeAddress);
    },
    [service]
  );

  // Protocol methods
  const methods = {
    joinPool: useCallback(
      () => withService((service) => service.joinPool()),
      [withService]
    ),

    stake: useCallback(
      (amount: number) => withService((service) => service.stake(amount)),
      [withService]
    ),

    unstake: useCallback(
      (amount: number) => withService((service) => service.unstake(amount)),
      [withService]
    ),

    mintROHR: useCallback(
      (amount: number, address: `0x${string}`) =>
        withService((service) => service.mintROHR(amount, address)),
      [withService]
    ),

    claimRewards: useCallback(
      () => withService((service) => service.claimRewards()),
      [withService]
    ),

    captionVideo: useCallback(
      (videoHash: string) =>
        withService((service) => service.captionVideo(videoHash)),
      [withService]
    ),

    completeCaptionVideo: useCallback(
      (captionHash: string) =>
        withService((service) => service.completeCaptionVideo(captionHash)),
      [withService]
    ),

    getVideoCaptionsByHash: useCallback(
      (videoHash: string) =>
        withService((service) => service.getVideoCaptionsByHash(videoHash)),
      [withService]
    ),

    getLastVideoCaption: useCallback(
      (userAddress: `0x${string}`) =>
        withService((service) => service.getLastVideoCaption(userAddress)),
      [withService]
    ),

    getIncompleteVideoCaptionTasks: useCallback(
      () =>
        withService((service, nodeAddress) =>
          service.getIncompleteVideoCaptionTasks(nodeAddress)
        ),
      [withService]
    ),

    isValidStaker: useCallback(
      () =>
        withService((service, nodeAddress) =>
          service.isValidStaker(nodeAddress)
        ),
      [withService]
    ),

    getStakedAmount: useCallback(
      () =>
        withService((service, nodeAddress) =>
          service.getStakedAmount(nodeAddress)
        ),
      [withService]
    ),
  };

  return {
    isInitialized: !!service,
    ...methods,
  };
};
