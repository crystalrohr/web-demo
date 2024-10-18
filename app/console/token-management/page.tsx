"use client";

import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { useCrystalRohrProtocol } from "@/hooks/use-crystalrohr-protocol";
import { ArrowDownCircle, ArrowUpCircle, Coins } from "lucide-react";
import React, { useState } from "react";

interface TokenCardProps {
  title: string;
  icon: React.ElementType;
  value: string;
  onSubmit: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  buttonText: string;
  action?: { value: string; call: () => void };
}

const TokenCard = ({
  title,
  icon: Icon,
  value,
  onSubmit,
  inputValue,
  setInputValue,
  buttonText,
  action,
}: TokenCardProps) => (
  <Card className="w-full bg-white shadow-[0_0_50px_7px_rgba(0,0,0,0.05)] border-[1px] border-[#EFF1F8] rounded-[20px]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-[#484E62]">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold text-[#02071E]">{value}</div>
    </CardContent>
    <CardFooter className="flex flex-col space-y-2">
      <Input
        type="number"
        min={1}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter amount"
        className="w-full"
      />
      <Button
        onClick={onSubmit}
        className="w-full bg-[#02071E] text-white hover:bg-[#1A1E2E] transition-colors duration-200"
      >
        {buttonText}
      </Button>
      {action && (
        <p
          className="font-atyp text-sm text-[#34C759] font-bold cursor-pointer"
          onClick={action.call}
        >
          {action.value}
        </p>
      )}
    </CardFooter>
  </Card>
);

export const TokenManagement = () => {
  const { stake, unstake, mintROHR, mintAPT } = useCrystalRohrProtocol();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [mintROHRAmount, setMintROHRAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleAction = async (
    action: Function,
    amount: string,
    setAmount: (value: string) => void,
    successMessage: string
  ) => {
    try {
      await action(Number(amount));
      setMessage(successMessage);
      setAmount("");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="flex flex-col h-full p-4 min-w-fit gap-4 flex-1">
      <h1 className="font-outfit font-semibold w-full gap-4">
        Token Management Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <TokenCard
          title="Mint ROHR"
          icon={Coins}
          value="Mint"
          onSubmit={() =>
            handleAction(
              mintROHR,
              mintROHRAmount,
              setMintROHRAmount,
              `Simulated minting of ${mintROHRAmount} ROHR`
            )
          }
          inputValue={mintROHRAmount}
          setInputValue={setMintROHRAmount}
          buttonText="Mint ROHR"
        />
        <TokenCard
          title="Stake ROHR"
          icon={ArrowUpCircle}
          value="Stake"
          onSubmit={() =>
            handleAction(
              stake,
              stakeAmount,
              setStakeAmount,
              `Successfully staked ${stakeAmount} ROHR`
            )
          }
          inputValue={stakeAmount}
          setInputValue={setStakeAmount}
          buttonText="Stake ROHR"
        />
        <TokenCard
          title="Unstake ROHR"
          icon={ArrowDownCircle}
          value="Unstake"
          onSubmit={() =>
            handleAction(
              unstake,
              unstakeAmount,
              setUnstakeAmount,
              `Successfully unstaked ${unstakeAmount} ROHR`
            )
          }
          inputValue={unstakeAmount}
          setInputValue={setUnstakeAmount}
          buttonText="Unstake ROHR"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-[#484E62]">
            Mint APT
          </CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#02071E]">APT</div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() =>
              handleAction(mintAPT, "", () => {}, "Successfully minted APT")
            }
            className="w-full bg-[#02071E] text-white hover:bg-[#1A1E2E] transition-colors duration-200"
          >
            Mint APT
          </Button>
        </CardFooter>
      </Card>

      {message && (
        <Alert variant={message.includes("Error") ? "destructive" : "default"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TokenManagement;
