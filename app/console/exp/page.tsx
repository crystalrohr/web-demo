"use client";

import { useState } from "react";

import Canvas from "@/components/molecules/canvas";
import useCaptureStills from "@/hooks/use-capture-stills";
import { useNodeService } from "@/hooks/use-node-service";

type NodeDetails = {
  stake: bigint;
  isActive: boolean;
  isTrusted: boolean;
  totalJobsCompleted: bigint;
  reputation: bigint;
};

const Dashboard = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>({
    stake: BigInt(1000),
    isActive: true,
    isTrusted: false,
    totalJobsCompleted: BigInt(5),
    reputation: BigInt(100),
  });

  const [nodeJobs, setNodeJobs] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [startChatExecuted, setStartChatExecuted] = useState(false);

  const {
    registerNode,
    deactivateNode,
    getNodeJobs,
    getNodeDetails,
    submitJobResult,
    getNodeIdFromAddress,
    distributeRewards,
    withdrawRewards,
    nodeId,
    setNodeId,
  } = useNodeService();
  const {
    canvasRef,
    captureSliced,
    sceneRef,
    videoRef,
    slicedRef,
    stopPolling,
    startPolling,
    stopUploadPolling,
    startUploadPolling,
    capturedImages,
    capturedScenes,
    processStatus,
    lastEvent,
  } = useCaptureStills();

  const hasVideo = "";

  const handleStake = () => {};

  const toggleContribution = () => {};

  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="bg-gradient-to-r from-[#550EFB] to-[#360C99] border border-[#360C99] rounded-lg p-6 mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      {content}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Canvas {...{ canvasRef }} />

      <h1 className="text-4xl font-bold mb-12 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
          Node Dashboard
        </span>
      </h1>

      {renderSection(
        "Stake Your Tokens",
        !nodeDetails?.isActive ? (
          <>
            <p className="mb-4">
              Contribute by staking your tokens and earn rewards.
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-black text-white border border-[#360C99] rounded p-2 flex-grow"
              />
              <button
                onClick={handleStake}
                disabled={isLoading}
                className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
              >
                Stake
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-2">Amount Staked:</p>
            <p className="text-3xl font-bold text-white">
              {nodeDetails.stake.toString()} Rohr
            </p>
          </div>
        )
      )}

      {nodeDetails?.isActive &&
        renderSection(
          "Contribute Resources",
          <>
            <p className="mb-4">
              Start or stop contributing your resources to the network.
            </p>
            <button
              onClick={toggleContribution}
              disabled={isLoading}
              className={`${
                nodeDetails.isActive ? "bg-[#1c074d]" : "bg-[#240a61]"
              } hover:bg-[#360C99] text-white rounded px-4 py-2 flex items-center`}
            >
              {nodeDetails.isActive
                ? "Stop Contributing"
                : "Start Contributing"}
            </button>
          </>
        )}

      {nodeDetails?.isActive &&
        renderSection(
          "Rewards",
          <div className="flex space-x-4">
            <button
              disabled={isLoading}
              className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
            >
              Withdraw Rewards
            </button>
            <button
              disabled={isLoading}
              className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
            >
              Distribute Rewards
            </button>
          </div>
        )}

      {nodeDetails?.isActive &&
        nodeDetails.isActive &&
        renderSection(
          "Current Jobs",
          <div>
            <div className="mb-4">
              <button
                onClick={() => setIsVideoVisible(!isVideoVisible)}
                className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
              >
                {isVideoVisible ? "Hide Video Player" : "Show Video Player"}
              </button>
            </div>
            {hasVideo && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isVideoVisible ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                  <video
                    crossOrigin="anonymous"
                    ref={videoRef}
                    controls
                    preload="metadata"
                    width="560px"
                    height="315px"
                  >
                    <source src={hasVideo} type="video/mp4" />
                  </video>

                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => captureSliced()}
                      className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
                    >
                      Capture Image
                    </button>
                    <button
                      onClick={() => stopPolling()}
                      className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
                    >
                      Stop polling
                    </button>
                    <button
                      onClick={() => startPolling()}
                      className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
                    >
                      Start polling
                    </button>
                  </div>

                  <div
                    ref={slicedRef}
                    style={{ display: "flex", flexWrap: "wrap" }}
                  ></div>
                  <div
                    ref={sceneRef}
                    style={{ display: "flex", flexWrap: "wrap" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

      {renderSection(
        "Why Stake?",
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔒",
              title: "Secure the Network",
              description:
                "Help maintain the integrity and security of the blockchain network.",
            },
            {
              icon: "📈",
              title: "Earn Rewards",
              description:
                "Receive staking rewards for your contribution to the network.",
            },
            {
              icon: "🛡️",
              title: "Governance Rights",
              description:
                "Participate in network governance and decision-making processes.",
            },
          ].map(({ icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="text-[#550EFB] text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
