import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import AudioVideoMiner from "@/components/molecules/audio-video-miner";
import { useCrystalRohrProtocol } from "@/hooks/use-crystalrohr-protocol";
import useStore from "@/store";

const POLLING_INTERVAL = 2000; // 2 seconds

const VideoQueueManager = () => {
  const [currentCID, setCurrentCID] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const { completeCaptionVideo, getIncompleteVideoCaptionTasks } =
    useCrystalRohrProtocol();
  const { updateStats } = useStore();

  const fetchIncompleteVideoCaptionTasks = useCallback(async () => {
    try {
      const tasks = await getIncompleteVideoCaptionTasks();
      if (tasks.length > 0) {
        setCurrentCID(tasks[0].ipfs_hash);
      }
    } catch (error) {
      console.error("Error fetching incomplete video caption tasks:", error);
    }
  }, [getIncompleteVideoCaptionTasks]);

  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    const pollForTasks = async () => {
      await fetchIncompleteVideoCaptionTasks();
      // Only set up the next interval if we still don't have a CID
      if (!currentCID) {
        pollingInterval.current = setInterval(
          fetchIncompleteVideoCaptionTasks,
          POLLING_INTERVAL
        );
      }
    };

    pollForTasks();

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [currentCID, fetchIncompleteVideoCaptionTasks]);

  const handleMiningComplete = async (
    capturedImages: string[],
    extractedAudio: Blob
  ) => {
    if (currentCID) {
      try {
        const formData = new FormData();
        capturedImages.forEach((image) =>
          formData.append("capturedImages", image)
        );
        formData.append("extractedAudio", extractedAudio, "audio.wav");

        const response = await fetch("/api/vision", {
          method: "POST",
          body: formData,
        });
        const message = await response.json();
        await completeCaptionVideo(message.cid);

        // Update analytics:
        // - Completed Captions increases by 1
        // - Scenes Processed increases by the number of captured images
        updateStats(capturedImages.length);

        toast.success("Caption Job Successful");
        setCurrentCID(null);
      } catch (error) {
        console.error("Error completing video caption:", error);
        setCurrentCID(null);
      }
    }
  };

  return (
    <div>
      {currentCID && (
        <AudioVideoMiner cid={currentCID} onComplete={handleMiningComplete} />
      )}
    </div>
  );
};

export default VideoQueueManager;
