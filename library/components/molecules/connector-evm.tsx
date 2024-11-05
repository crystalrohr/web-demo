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
import { NetworkId } from "@/components/molecules/network-select";
import { useConnectorHelper } from "@/hooks/use-connector-helper";
import { useMounted } from "@/hooks/use-mounted";
import { ellipsisAddress, formatNetworkName, getChain } from "@/utils";

interface ConnectorProps {
  network: NetworkId;
}

export const WagmiConnector = ({ network }: ConnectorProps) => {
  const { open, setOpen } = useModal();
  const isMounted = useMounted();
  const { handleNewConnection, currentConnection, disconnectCurrent } =
    useConnectorHelper();
  const { chain, connector, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { reset } = useConnect$1();

  const [isActive, setIsActive] = useState(false);

  const chainName = formatNetworkName(network);
  const { network: currentNetwork } = currentConnection;

  const handleChainSwitch = useCallback(() => {
    const targetChain = getChain(chainName);
    switchChain({ connector, chainId: targetChain.id });
  }, [chainName, connector, switchChain]);

  const handleConnect = useCallback(() => {
    setOpen(false);
    disconnect();
    reset();
    setTimeout(() => {
      setIsActive(true);
    }, 50);
  }, [disconnect, reset, setOpen]);

  const handleDisconnect = useCallback(() => {
    setOpen(false);
    disconnect();
    reset();
    disconnectCurrent();
  }, [setOpen, disconnect]);

  useEffect(() => {
    if (!isActive) return;
    setOpen(true);
    handleNewConnection(network, "wagmi", "");
  }, [isActive, setOpen, handleNewConnection, network]);

  useEffect(() => {
    if (currentNetwork === network && isConnected) {
      handleChainSwitch();
    }
  }, [isActive, handleChainSwitch, currentNetwork, network, isConnected]);

  if (!isMounted) return null;

  if (chain?.name.toLowerCase() === chainName) {
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

export const WagmiConnection = ({}: ConnectorProps) => {
  const { address, isConnected } = useAccount();
  const isMounted = useMounted();
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address,
  });

  if (!isMounted) return null;

  if (isConnected && address) {
    return (
      <button className="bg-[#138FA8] active:bg-[#138FA8] font-outfit font-[16px] text-[white] px-6 rounded-[32px] py-3.5">
        {ensName || ellipsisAddress(address)}
      </button>
    );
  }
};
