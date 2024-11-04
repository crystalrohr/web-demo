"use client";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import AdaptiveModal from "@/components/molecules/adaptive-modal";
import NetworkSelect, {
  NetworkIds,
} from "@/components/molecules/network-select";
import { NetworkModalContext } from "@/types";
import { useEffect, useState } from "react";

const ConfirmPage = ({
  context,
  onNavigate,
  onClose,
}: {
  context: NetworkModalContext;
  onNavigate: (pageId: string) => void;
  onClose: () => void;
}) => (
  <div>
    <p>Confirm connection to {context.network}?</p>
    <Button
      onClick={() => {
        onClose();
        onNavigate("select");
      }}
    >
      Confirm
    </Button>
  </div>
);

const TokenManagementPage = () => {
  const [toNetwork, setToNetwork] = useState<NetworkModalContext>({
    ignoredNetworks: [NetworkIds["base-sepolia"], NetworkIds.ethereum],
  } as NetworkModalContext);

  useEffect(() => {
    if (toNetwork.network) {
      alert(`Network changed to: ${toNetwork.network}`);
    }
  }, [toNetwork]);

  return (
    <div className="relative flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-cyan-600 to-[#000011]">
      <div className="flex flex-col p-6 gap-4 w-full max-w-lg bg-black/20 rounded-2xl shadow-lg">
        <Tabs defaultValue="faucet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 backdrop-blur-3xl bg-black/40 text-white">
            <TabsTrigger
              className="data-[state=active]:bg-black/30 transition-colors"
              value="faucet"
            >
              Faucet
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-black/30 transition-colors"
              value="bridge"
            >
              Bridge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faucet">
            <div className="flex flex-col items-center gap-10 mt-4">
              <div className="flex flex-col items-center">
                <p className=" text-3xl font-outfit font-bold">
                  Get ROHR Testnet Tokens!
                </p>
                <p className="text-base font-semibold font-outfit">
                  Faucet mints ROHR on Aptos, Base Sepolia, Sepolia and Sui
                </p>
              </div>

              <div className="flex flex-col items-center gap-5 w-full">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="network">Network</Label>
                  <Input disabled id="network" />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="token">Token</Label>
                  <Input disabled id="token" value={"ROHR"} />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input disabled id="wallet" />
                </div>
              </div>

              <button
                onClick={() => alert("faucet")}
                className="w-full bg-[#138FA8] active:bg-[#138FA8] py-3 px-6 rounded-[32px] font-outfit font-medium flex items-center justify-center text-white text-base leading-normal m-0 border-[none] shadow-[0_0px_1px_hsla(0,0%,0%,0.2),0_1px_2px_hsla(0,0%,0%,0.2)] hover:shadow-[0_0px_1px_hsla(0,0%,0%,0.6),0_1px_8px_hsla(0,0%,0%,0.2)] active:shadow-[0_0px_1px_hsla(0,0%,0%,0.4)] active:translate-y-[1px]"
              >
                Mint ROHR Token
              </button>
            </div>
          </TabsContent>

          <TabsContent value="bridge">
            <div className="flex flex-col items-center gap-10 mt-4">
              <div className="flex flex-col items-center">
                <p className=" text-3xl font-outfit font-bold">
                  Bridge ROHR Across Chains!
                </p>
                <p className="text-base font-semibold font-outfit">
                  Move your ROHR across Aptos, Base Sepolia, Sepolia and Sui
                </p>
              </div>

              <div className="flex flex-col items-center gap-5 w-full">
                <div className="flex items-center gap-5 w-full">
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="network">From</Label>
                    <AdaptiveModal
                      trigger={<Button disabled>Connect</Button>}
                      title="Select Network"
                      actions={[
                        {
                          id: "ethereum",
                          label: "Ethereum",
                          onClick: (context) =>
                            console.log("Selected Ethereum"),
                        },
                        {
                          id: "polygon",
                          label: "Polygon",
                          onClick: (context) => console.log("Selected Polygon"),
                        },
                      ]}
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="token">To</Label>
                    <AdaptiveModal
                      trigger={
                        <Button>
                          {toNetwork.network ? toNetwork.network : "Connect"}
                        </Button>
                      }
                      initialPage="select"
                      context={toNetwork}
                      onContextChange={(newContext) => setToNetwork(newContext)}
                      pages={[
                        {
                          id: "select",
                          title: "Select Network",
                          component: NetworkSelect,
                        },
                        {
                          id: "confirm",
                          title: "Confirm Connection",
                          component: ConfirmPage,
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="wallet">To Wallet Address</Label>
                  <Input id="wallet" />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="wallet">Bridge Amount</Label>
                  <Input id="wallet" />
                </div>
              </div>

              <button
                onClick={() => alert("faucet")}
                className="w-full bg-[#138FA8] active:bg-[#138FA8] py-3 px-6 rounded-[32px] font-outfit font-medium flex items-center justify-center text-white text-base leading-normal m-0 border-[none] shadow-[0_0px_1px_hsla(0,0%,0%,0.2),0_1px_2px_hsla(0,0%,0%,0.2)] hover:shadow-[0_0px_1px_hsla(0,0%,0%,0.6),0_1px_8px_hsla(0,0%,0%,0.2)] active:shadow-[0_0px_1px_hsla(0,0%,0%,0.4)] active:translate-y-[1px]"
              >
                Bridge ROHR Token
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TokenManagementPage;
