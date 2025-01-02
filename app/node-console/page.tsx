"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GlobeMethods } from "react-globe.gl";
import { toast } from "sonner";

import { Button } from "@/components/atoms/button";
import { Card, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import NodeSetupMultiStepper from "@/components/molecules/node-setup-multi-stepper";
import StandbyButton from "@/components/molecules/standby-button";
import VideoQueueManager from "@/components/organisms/video-queue-manager";
import { useCrystalRohrProtocol } from "@/hooks/use-crystalrohr-protocol";
import useStore from "@/store";
import { formatUnits } from "viem";

const Globe = dynamic(() => import("@/components/organisms/wrapped-globe"), {
  ssr: false,
});

const GLOBE_POINTS = 250;
const CRYSTAL_TYPES = ["DePIN", "Video", "Caption", "Network"] as const;
const POINT_COLORS = ["red", "white", "blue", "green"] as const;

interface TokenCardProps {
  title: string;
  icon: React.ElementType;
  onSubmit: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  buttonText: string;
  action?: { value: string; call: () => void };
}

const TokenCard = ({
  title,
  icon: Icon,
  onSubmit,
  inputValue,
  setInputValue,
  buttonText,
  action,
}: TokenCardProps) => (
  <Card className="flex flex-col w-full p-4 gap-6 bg-card text-card-foreground">
    <div className="flex flex-row items-center justify-between">
      <CardTitle className="text-base font-outfit font-semibold text-[#484E62] dark:text-[#B7BDD5]">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>

    <div className="flex flex-col space-y-2">
      <Input
        type="number"
        min={1}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter amount"
        className="w-full"
      />
      <Button onClick={onSubmit} className="w-full bg-primary">
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
    </div>
  </Card>
);

const ConsolePage = () => {
  const [currentView, setCurrentView] = useState("stepper"); // stepper, stake, standby, dashboard
  const globeRef = useRef<GlobeMethods>();
  const [loaded, setLoaded] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakedAmount, setStakedAmount] = useState(0);
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const { completedCaptions, scenesProcessed } = useStore();

  const { stake, unstake, getStakedAmount } = useCrystalRohrProtocol();
  const { theme } = useTheme();

  const gData = useMemo(
    () =>
      Array.from({ length: GLOBE_POINTS }, () => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() / 3,
        color: POINT_COLORS[Math.floor(Math.random() * POINT_COLORS.length)],
        crystal:
          CRYSTAL_TYPES[Math.floor(Math.random() * CRYSTAL_TYPES.length)],
      })),
    []
  );

  useLayoutEffect(() => {
    if (globeRef.current && typeof window !== "undefined") {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.0;
      controls.maxDistance = 320;
      controls.minDistance = 320;
      controls.enableZoom = false;
    }
  }, [loaded]);

  useEffect(() => {
    if (currentView === "dashboard") {
      getStakedAmount()
        .then((amount) =>
          setStakedAmount(Number(formatUnits(BigInt(amount), 8)))
        )
        .catch((error) => console.error("Error getting staked amount:", error));
    }
  }, [getStakedAmount, currentView]);

  const handleAction = async (
    action: Function,
    amount: string,
    setAmount: (value: string) => void,
    successMessage: string
  ) => {
    try {
      await action(Number(amount));
      toast.success(successMessage);
      setAmount("");
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    const handleShowStakeUI = () => setCurrentView("stake");
    const handleShowJoinButton = () => setCurrentView("standby");

    window.addEventListener("showStakeUI", handleShowStakeUI);
    window.addEventListener("showJoinButton", handleShowJoinButton);

    return () => {
      window.removeEventListener("showStakeUI", handleShowStakeUI);
      window.removeEventListener("showJoinButton", handleShowJoinButton);
    };
  }, []);

  const handleSetupComplete = () => {
    console.log("Setup complete!");
  };

  const handleSetupFail = () => {
    console.log("Setup failed!");
  };

  const handleStandbyClick = () => {
    setCurrentView("dashboard");
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  };

  return (
    <div className="flex flex-col justify-between items-center flex-1 overflow-hidden w-full">
      <AnimatePresence mode="wait" initial={false}>
        {currentView !== "dashboard" && (
          <motion.div
            key="setup"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={transition}
            className="flex flex-col justify-start items-center gap-16 w-full"
          >
            <div className="flex flex-col justify-center items-center gap-1 p-0">
              <p className="font-atyp text-[64px] text-balance w-[15ch] leading-tight text-center">
                Start your node and earn rohr rewards!
              </p>
              <p className="font-medium text-sm leading-[17px] text-[#484E62]">
                To secure the network, you&apos;ll need to stake some coins.
                Click{" "}
                <Link
                  href={"/token-management"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#138FA8]"
                >
                  here
                </Link>{" "}
                to access a faucet.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {currentView === "stepper" && (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <NodeSetupMultiStepper
                    onComplete={handleSetupComplete}
                    onFail={handleSetupFail}
                  />
                </motion.div>
              )}

              {currentView === "stake" && (
                <motion.div
                  key="stake"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 flex-col w-full max-w-sm"
                >
                  <Input
                    type="number"
                    min={1}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full"
                  />
                  <button
                    onClick={async () => {
                      try {
                        await stake(parseFloat(stakeAmount));
                        toast.success("Stake successful!");
                        location.reload();
                      } catch (error) {
                        const errorMessage = (error as Error).message;
                        if (errorMessage.includes("0xe450d38c")) {
                          toast.error(
                            "Please get tokens from the faucet first"
                          );
                        } else if (errorMessage.includes("0xf1bc94d2")) {
                          toast.error(
                            "Please stake more tokens—minimum 1 ROHR"
                          );
                        } else {
                          toast.error("Stake failed: " + errorMessage);
                        }
                      }
                    }}
                    className="bg-[#138FA8] active:bg-[#138FA8] py-3 px-6 rounded-[32px] font-outfit font-medium flex items-center justify-center text-white text-base leading-normal m-0 border-[none] shadow-[0_0px_1px_hsla(0,0%,0%,0.2),0_1px_2px_hsla(0,0%,0%,0.2)] hover:shadow-[0_0px_1px_hsla(0,0%,0%,0.6),0_1px_8px_hsla(0,0%,0%,0.2)] active:shadow-[0_0px_1px_hsla(0,0%,0%,0.4)] active:translate-y-[1px]"
                  >
                    Stake ROHR to join
                  </button>
                </motion.div>
              )}

              {currentView === "standby" && (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StandbyButton onClick={handleStandbyClick} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentView === "dashboard" && (
          <motion.div
            key="dashboard"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={transition}
            className="w-full flex-1"
          >
            <div className="flex justify-center flex-1 w-full">
              <div className="flex flex-col">
                <div className="flex flex-col p-4 min-w-fit gap-4">
                  <h1 className="font-outfit font-semibold w-full gap-4">
                    Node Analytics
                  </h1>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="flex min-w-80 w-fit flex-row justify-between p-4 bg-card text-card-foreground">
                      <div className="flex flex-col gap-6">
                        <p className="font-outfit font-semibold text-[#484E62] dark:text-[#B7BDD5]">
                          Completed Captions
                        </p>
                        <p className="text-4xl font-outfit font-bold">
                          {completedCaptions}
                        </p>
                      </div>
                    </Card>

                    <Card className="flex min-w-80 w-fit flex-row justify-between p-4 bg-card text-card-foreground">
                      <div className="flex flex-col gap-6">
                        <p className="font-outfit font-semibold text-[#484E62] dark:text-[#B7BDD5]">
                          Scenes Processed
                        </p>
                        <p className="text-4xl font-outfit font-bold">
                          {scenesProcessed}
                        </p>
                      </div>
                    </Card>

                    <Card className="flex min-w-80 w-fit flex-row justify-between p-4 bg-card text-card-foreground">
                      <div className="flex flex-col gap-6">
                        <p className="font-outfit font-semibold text-[#484E62] dark:text-[#B7BDD5]">
                          Total ROHR Staked
                        </p>
                        <p className="text-4xl font-outfit font-bold">
                          {stakedAmount}
                        </p>
                      </div>
                    </Card>

                    <Card className="flex w-full justify-between p-4 cursor-pointer bg-card text-card-foreground">
                      <div className="flex flex-col gap-6">
                        <p className="font-outfit font-semibold text-[#484E62] dark:text-[#B7BDD5]">
                          Session Rewards
                        </p>
                        <p className="text-4xl font-outfit font-bold">
                          {scenesProcessed}
                        </p>
                      </div>
                      <p className="font-atyp text-sm text-[#34C759] font-bold">
                        Collect ↗
                      </p>
                    </Card>
                  </div>
                </div>
                <div className="flex flex-col p-4 min-w-fit gap-4">
                  <h1 className="font-outfit font-semibold w-full gap-4">
                    Stake Manager
                  </h1>
                  <div className="grid grid-cols-2 gap-4">
                    <TokenCard
                      title="Stake"
                      icon={ArrowUpCircle}
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
                      title="Unstake"
                      icon={ArrowDownCircle}
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
                </div>
                <div className="flex flex-col p-4 min-w-fit gap-4">
                  <h1 className="font-outfit font-semibold w-full gap-4">
                    Video Caption Queue
                  </h1>
                  <div className="grid grid-cols-2 gap-4">
                    <VideoQueueManager />
                  </div>
                </div>
                <div className="flex justify-center overflow-hidden mb-4 h-[275px]">
                  <div className="-mt-4">
                    <Globe
                      onGlobeReady={() => setLoaded(true)}
                      globeRef={globeRef}
                      width={600}
                      height={500}
                      globeImageUrl={
                        theme == "dark" ? "/earth-night.jpg" : "/earth-day.jpeg"
                      }
                      backgroundColor="rgba(0, 0, 0, 0)"
                      atmosphereColor="rgba(0, 234, 255, 0.665)"
                      atmosphereAltitude={0.3}
                      pointsData={gData}
                      arcsData={gData}
                      pointAltitude="size"
                      pointColor="color"
                      pointLabel="crystal"
                    />
                  </div>
                </div>
              </div>
            </div>{" "}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="font-outfit p-4 text-sm">© Crystalrohr 2024</p>
    </div>
  );
};

export default ConsolePage;
