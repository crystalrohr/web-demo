import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import MultiStepLoader from "@/components/atoms/multi-step-loader";
import { RECONNECTION_TIMEOUT } from "@/hooks/use-connector-helper";
import useStore from "@/store";

export type StepAction = {
  run: () => Promise<boolean>;
  onSuccess?: () => void;
  onFailure?: () => void;
  isOptional?: boolean;
};

export type LoadingState = {
  text: string;
  action?: StepAction;
};

export const NodeSetupMultiStepper = ({
  onComplete,
  onFail,
}: {
  onComplete?: () => void;
  onFail?: () => void;
}) => {
  const [currentState, setCurrentState] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [hasError, setHasError] = useState(false);

  const router = useRouter();
  const { currentConnection } = useStore();

  const loadingStates: LoadingState[] = [
    {
      text: "Checking connection",
      action: {
        run: async () => {
          try {
            const startTime = Date.now();

            while (Date.now() - startTime < RECONNECTION_TIMEOUT - 1000) {
              if (currentConnection.network) {
                return true;
              }
              await new Promise((resolve) => setTimeout(resolve, 1_000));
            }

            return false;
          } catch {
            return false;
          }
        },
        onFailure: () => {
          toast.error("Not connected—Please connect and try again.");
          router.push("/");
        },
      },
    },
    {
      text: "Node connected",
      action: {
        run: async () => {
          try {
            return true;
          } catch {
            return false;
          }
        },
        onFailure: () => {
          setHasError(true);
          onFail?.();
        },
      },
    },
    {
      text: "Checking account stake",
      action: {
        run: async () => {
          try {
            const hasStake = false; // This would be dynamic
            return hasStake;
          } catch {
            return false;
          }
        },
        onFailure: () => {
          window.dispatchEvent(new CustomEvent("showStakeUI"));
        },
      },
    },
    { text: "Stake fulfilled" },
    { text: "Initializing resources" },
    {
      text: "Setup complete",
      action: {
        run: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return true;
        },
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent("showJoinButton"));
          onComplete?.();
        },
      },
    },
  ];

  const runAction = async (
    action: StepAction,
    didCancel: { current: boolean }
  ) => {
    try {
      // If already cancelled, don't proceed
      if (didCancel.current) {
        return true;
      }

      const result = await action.run();

      // Check if cancelled after the async operation
      if (didCancel.current) {
        return true;
      }

      if (result) {
        action.onSuccess?.();
        return true;
      } else {
        action.onFailure?.();
        return action.isOptional || false;
      }
    } catch {
      // Only call onFailure if not cancelled
      if (!didCancel.current) {
        action.onFailure?.();
      }
      return action.isOptional || false;
    }
  };

  useEffect(() => {
    // Use an object reference for didCancel to ensure it's properly shared
    const didCancel = { current: false };

    const processCurrentState = async () => {
      if (!isRunning || hasError) return;

      const currentStep = loadingStates[currentState];

      if (currentStep.action) {
        const success = await runAction(currentStep.action, didCancel);
        if (!success && !currentStep.action.isOptional) {
          setIsRunning(false);
          return;
        }
      }

      // Only proceed if not cancelled
      if (!didCancel.current && currentState < loadingStates.length - 1) {
        setTimeout(() => {
          if (!didCancel.current) {
            setCurrentState((prev) => prev + 1);
          }
        }, 2000);
      } else if (!didCancel.current) {
        setIsRunning(false);
        onComplete?.();
      }
    };

    processCurrentState();

    return () => {
      didCancel.current = true;
    };
  }, [
    currentState,
    isRunning,
    hasError,
    loadingStates,
    currentConnection,
    onComplete,
  ]);

  return (
    <AnimatePresence mode="wait">
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MultiStepLoader value={currentState} loadingStates={loadingStates} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeSetupMultiStepper;
