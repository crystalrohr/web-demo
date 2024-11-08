"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useConnectorHelper } from "@/hooks/use-connector-helper";
import { useAptosKeyless } from "@/providers/keyless";
import { ConnectorProps } from "@/types";
import { ellipsisAddress } from "@/utils";

export const KeylessConnector = ({ network }: ConnectorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { handleNewConnection, disconnectCurrent } = useConnectorHelper();
  const { keylessAccount, getLoginUrl, logout, setNetwork, currentNetwork } =
    useAptosKeyless();

  const handleLogin = () => {
    localStorage.setItem("loginRedirectUrl", pathname);
    const loginUrl = getLoginUrl();
    handleNewConnection(network, "keyless", "");
    router.push(loginUrl);
  };

  const handleLogout = () => {
    logout();
    disconnectCurrent();
  };

  if (!!keylessAccount) {
    return (
      <button
        onClick={handleLogout}
        className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
    >
      Login with Google
    </button>
  );
};

export const KeylessConnection = () => {
  const { keylessAccount, handleCallback, currentNetwork } = useAptosKeyless();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const callbackUrl =
      typeof window !== "undefined" ? window.location.href : "";

    if (callbackUrl.includes("id_token=")) {
      handleCallback(callbackUrl).catch(console.error);
    }
  }, [handleCallback]);

  if (!isClient) {
    return "loading...";
  }

  if (!keylessAccount) return null;

  const explorerUrl = `https://explorer.aptoslabs.com/account/${keylessAccount.accountAddress.toString()}/transactions?network=${currentNetwork.toLowerCase()}`;

  return (
    <Link
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#138FA8] active:bg-[#138FA8] font-outfit font-[16px] text-[white] px-6 rounded-[32px] py-3.5"
    >
      {ellipsisAddress(keylessAccount.accountAddress.toString())}
    </Link>
  );
};
