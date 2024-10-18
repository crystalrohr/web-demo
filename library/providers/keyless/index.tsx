import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import {
  Aptos,
  AptosConfig,
  Network,
  EphemeralKeyPair,
  KeylessAccount,
  ProofFetchStatus
} from "@aptos-labs/ts-sdk";
import { jwtDecode } from "jwt-decode";

interface AptosKeylessConfig {
  network: Network;
  clientId: string;
  redirectUri: string;
}

interface AptosKeylessContextType {
  keylessAccount: KeylessAccount | null;
  getLoginUrl: () => string;
  handleCallback: (url: string) => Promise<KeylessAccount>;
  signAndSubmitTransaction: (transaction: any) => Promise<string>;
  logout: () => void;
  setNetwork: (network: Network) => void;
  currentNetwork: Network;
}

const defaultConfig: AptosKeylessConfig = {
  network: Network.DEVNET,
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "",
};

const AptosKeylessContext = createContext<AptosKeylessContextType | undefined>(undefined);

export const AptosKeylessProvider: React.FC<{
  children: React.ReactNode;
  initialConfig?: Partial<AptosKeylessConfig>;
}> = ({ children, initialConfig = {} }) => {
  const [config, setConfig] = useState<AptosKeylessConfig>({ ...defaultConfig, ...initialConfig });
  const [aptos, setAptos] = useState(() => new Aptos(new AptosConfig({ network: config.network })));
  const [keylessAccount, setKeylessAccount] = useState<KeylessAccount | null>(null);

  const deriveAccount = useCallback(async (jwt: string, ekp: EphemeralKeyPair) => {
    const proofFetchCallback = async (res: ProofFetchStatus) => {
      if (res.status === "Failed") {
        logout();
      }
    };

    return await aptos.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair: ekp,
      proofFetchCallback,
    });
  }, [aptos]);

  useEffect(() => {
    const loadAccount = async () => {
      const storedJwt = localStorage.getItem("@aptos/jwt");
      const storedEkp = localStorage.getItem("@aptos/ephemeral_key_pair");
      
      if (storedJwt && storedEkp) {
        try {
          const ekp = EphemeralKeyPair.fromBytes(new Uint8Array(JSON.parse(storedEkp)));
          const account = await deriveAccount(storedJwt, ekp);
          setKeylessAccount(account);
        } catch (error) {
          console.error("Failed to load account:", error);
          logout();
        }
      }
    };

    loadAccount();
  }, [deriveAccount]);

  const setNetwork = useCallback((network: Network) => {
    setConfig((prevConfig) => ({ ...prevConfig, network }));
    const newAptos = new Aptos(new AptosConfig({ network }));
    setAptos(newAptos);
    // Re-derive the account with the new network if logged in
    if (keylessAccount) {
      const storedJwt = localStorage.getItem("@aptos/jwt");
      const storedEkp = localStorage.getItem("@aptos/ephemeral_key_pair");
      if (storedJwt && storedEkp) {
        const ekp = EphemeralKeyPair.fromBytes(new Uint8Array(JSON.parse(storedEkp)));
        deriveAccount(storedJwt, ekp).then(setKeylessAccount);
      }
    }
  }, [keylessAccount, deriveAccount]);

  const getLoginUrl = useCallback(() => {
    const ephemeralKeyPair = EphemeralKeyPair.generate();
    localStorage.setItem("@aptos/ephemeral_key_pair", JSON.stringify(Array.from(ephemeralKeyPair.bcsToBytes())));
    const nonce = ephemeralKeyPair.nonce;
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&scope=openid+email+profile&nonce=${nonce}&redirect_uri=${window.location.origin}${config.redirectUri}&client_id=${config.clientId}`;
  }, [config.clientId, config.redirectUri]);

  const handleCallback = useCallback(async (url: string) => {
    const urlObject = new URL(url);
    const fragment = urlObject.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const jwt = params.get("id_token");

    if (!jwt) throw new Error("JWT not found in URL");

    const payload = jwtDecode<{ nonce: string }>(jwt);
    const jwtNonce = payload.nonce;

    const storedEkp = localStorage.getItem("@aptos/ephemeral_key_pair");
    const ekp = storedEkp ? EphemeralKeyPair.fromBytes(new Uint8Array(JSON.parse(storedEkp))) : null;

    if (!ekp || ekp.nonce !== jwtNonce) {
      throw new Error("Ephemeral key pair not found or nonce mismatch");
    }

    const account = await deriveAccount(jwt, ekp);

    localStorage.setItem("@aptos/jwt", jwt);
    setKeylessAccount(account);
    return account;
  }, [deriveAccount]);

  const signAndSubmitTransaction = useCallback(async (transaction: any) => {
    if (!keylessAccount) throw new Error("Keyless account not found");

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: keylessAccount,
      transaction,
    });
    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return committedTransactionResponse.hash;
  }, [aptos, keylessAccount]);

  const logout = useCallback(() => {
    localStorage.removeItem("@aptos/jwt");
    localStorage.removeItem("@aptos/ephemeral_key_pair");
    setKeylessAccount(null);
  }, []);

  const value = {
    keylessAccount,
    getLoginUrl,
    handleCallback,
    signAndSubmitTransaction,
    logout,
    setNetwork,
    currentNetwork: config.network,
  };

  return (
    <AptosKeylessContext.Provider value={value}>
      {children}
    </AptosKeylessContext.Provider>
  );
};

export const useAptosKeyless = () => {
  const context = useContext(AptosKeylessContext);
  if (context === undefined) {
    throw new Error("useAptosKeyless must be used within an AptosKeylessProvider");
  }
  return context;
};