import MultiStepLoader from "@/components/atoms/multi-step-loader";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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

  const loadingStates: LoadingState[] = [
    {
      text: "Checking connection",
      action: {
        run: async () => {
          // Simulate connection check
          try {
            // Replace with actual connection check
            await new Promise((resolve) => setTimeout(resolve, 5000));
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
      text: "Node connected",
      action: {
        run: async () => {
          // Verify node connection
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return true;
          } catch {
            return false;
          }
        },
        onFailure: () => {
          window.location.href = "/"; // Redirect home on failure
        },
      },
    },
    {
      text: "Checking account stake",
      action: {
        run: async () => {
          // Check if account has stake
          try {
            // Replace with actual stake check
            const hasStake = true; // This would be dynamic
            return hasStake;
          } catch {
            return false;
          }
        },
        onFailure: () => {
          // Show stake UI
          window.dispatchEvent(new CustomEvent("showStakeUI"));
        },
      },
    },
    { text: "Saving state" },
    { text: "Initializing resources" },
    {
      text: "Setup complete",
      action: {
        run: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return true;
        },
        onSuccess: () => {
          // Show join button
          window.dispatchEvent(new CustomEvent("showJoinButton"));
          onComplete?.();
        },
      },
    },
  ];

  const runAction = async (action: StepAction) => {
    try {
      const result = await action.run();
      if (result) {
        action.onSuccess?.();
        return true;
      } else {
        action.onFailure?.();
        return action.isOptional || false;
      }
    } catch {
      action.onFailure?.();
      return action.isOptional || false;
    }
  };

  useEffect(() => {
    const processCurrentState = async () => {
      if (!isRunning || hasError) return;

      const currentStep = loadingStates[currentState];

      if (currentStep.action) {
        const success = await runAction(currentStep.action);
        if (!success && !currentStep.action.isOptional) {
          setIsRunning(false);
          return;
        }
      }

      // Move to next state after delay
      if (currentState < loadingStates.length - 1) {
        setTimeout(() => {
          setCurrentState((prev) => prev + 1);
        }, 2000);
      } else {
        setIsRunning(false);
        onComplete?.();
      }
    };

    processCurrentState();
  }, [currentState, isRunning, hasError]);

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
