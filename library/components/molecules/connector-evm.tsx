"use client";

import { useModal } from "connectkit";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useConnect as useConnect$1,
  useDisconnect,
  useEnsName,
  useSwitchChain,
} from "wagmi";

import { Button } from "@/components/atoms/button";
import { useConnectorHelper } from "@/hooks/use-connector-helper";
import { useMounted } from "@/hooks/use-mounted";
import { ConnectorProps } from "@/types";
import { ellipsisAddress, formatNetworkName, getChain } from "@/utils";

export const WagmiConnector = ({ network }: ConnectorProps) => {
  const [isActive, setIsActive] = useState(false);

  const { setOpen } = useModal();
  const isMounted = useMounted();
  const { handleNewConnection, disconnectCurrent } = useConnectorHelper();
  const { isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { reset } = useConnect$1();

  const chainName = formatNetworkName(network);
  const isCorrectChain = chain?.name.toLowerCase() === chainName;

  const handleDisconnect = useCallback(() => {
    setOpen(false);
    disconnect();
    reset();
    disconnectCurrent();
  }, [disconnect, reset, setOpen, disconnectCurrent]);

  const handleConnect = useCallback(async () => {
    setOpen(false);
    disconnect();
    reset();
    setTimeout(() => {
      setIsActive(true);
    }, 1000);
  }, [setIsActive, disconnect, reset, setOpen]);

  // Handle successful connection
  useEffect(() => {
    const handleSuccessfulConnection = async () => {
      if (!isActive) return;
      setOpen(true);
      await handleNewConnection(network, "wagmi", "");
    };
    handleSuccessfulConnection();
  }, [setOpen, isActive, handleNewConnection, network]);

  if (!isMounted) return null;

  if (isCorrectChain && isConnected) {
    return (
      <Button
        onClick={handleDisconnect}
        className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
      >
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
    >
      Connect Wallet
    </Button>
  );
};

export const WagmiConnection = ({ network }: ConnectorProps) => {
  const { address, isConnected, chain, connector } = useAccount();
  const isMounted = useMounted();
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address,
  });
  const { switchChain } = useSwitchChain();
  const { currentConnection } = useConnectorHelper();

  const chainName = formatNetworkName(network);
  const { network: currentNetwork } = currentConnection;
  const isCorrectChain = chain?.name.toLowerCase() === chainName;

  const handleChainSwitch = useCallback(async () => {
    if (!connector) return;
    const targetChain = getChain(chainName);
    try {
      switchChain({ connector, chainId: targetChain.id });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  }, [chainName, connector, switchChain]);

  // Handle chain switching for existing connections
  useEffect(() => {
    const handleExistingConnection = async () => {
      if (currentNetwork === network && isConnected && !isCorrectChain) {
        await handleChainSwitch();
      }
    };

    handleExistingConnection();
  }, [currentNetwork, network, isConnected, isCorrectChain, handleChainSwitch]);

  if (!isMounted) return null;

  if (isConnected && address) {
    return (
      <button className="bg-[#138FA8] active:bg-[#138FA8] font-outfit font-[16px] text-[white] px-6 rounded-[32px] py-3.5">
        {ensName || ellipsisAddress(address)}
      </button>
    );
  }

  return null;
};
