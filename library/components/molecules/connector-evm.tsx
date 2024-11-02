"use client";

import { useModal } from "connectkit";
import { useAccount, useEnsName } from "wagmi";

import { Button } from "@/components/atoms/button";
import { useMounted } from "@/hooks/use-mounted";
import { ellipsisAddress } from "@/utils";

const EVMConnectButton = () => {
  const isMounted = useMounted();
  const { open, setOpen } = useModal();
  const { address, isConnected, chain } = useAccount();

  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address,
  });

  const show = () => {
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
  };

  // Early returns
  if (!isMounted) return null;

  // Default button rendering
  if (isConnected && address) {
    return (
      <Button
        onClick={show}
        className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
      >
        {ensName || ellipsisAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      onClick={show}
      className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
    >
      Connect Wallet
    </Button>
  );
};

export default EVMConnectButton;
