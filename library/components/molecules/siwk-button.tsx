"use client";

import { Network } from "@aptos-labs/ts-sdk";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAptosKeyless } from "@/providers/keyless";
import { ellipsisAddress } from "@/utils";

export default function SignInWithKeyless() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  const {
    keylessAccount,
    getLoginUrl,
    handleCallback,
    logout,
    setNetwork,
    currentNetwork,
  } = useAptosKeyless();

  useEffect(() => {
    setIsClient(true);
    const callbackUrl =
      typeof window !== "undefined" ? window.location.href : "";

    if (callbackUrl.includes("id_token=")) {
      handleCallback(callbackUrl).catch(console.error);
    }
  }, [handleCallback]);

  const handleLogin = () => {
    // Store the current path before redirecting
    localStorage.setItem("loginRedirectUrl", pathname);
    const loginUrl = getLoginUrl();
    router.push(loginUrl);
  };

  const _toggleNetwork = () => {
    setNetwork(
      currentNetwork === Network.DEVNET ? Network.TESTNET : Network.DEVNET
    );
  };

  if (!isClient) {
    return "loading...";
  }

  const explorerUrl = keylessAccount
    ? `https://explorer.aptoslabs.com/account/${keylessAccount.accountAddress.toString()}/transactions?network=${currentNetwork.toLowerCase()}`
    : "";

  return (
    <div className="flex items-center justify-between">
      {keylessAccount ? (
        <div className="flex gap-4">
          <Link
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#138FA8] active:bg-[#138FA8] font-outfit font-[16px] text-[white] px-6 rounded-[32px] py-3.5"
          >
            {ellipsisAddress(keylessAccount.accountAddress.toString())}
          </Link>

          <button
            onClick={logout}
            className="font-outfit font-[16px] bg-black text-[white] px-6 rounded-[32px] py-3.5"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="font-outfit font-[16px] bg-black text-[white] px-6 rounded-[32px] py-3.5"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
