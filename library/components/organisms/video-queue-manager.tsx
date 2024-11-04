import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import AudioVideoMiner from "@/components/molecules/audio-video-miner";
import { useCrystalRohrProtocol } from "@/hooks/use-crystalrohr-protocol";
import usePollingEffect from "@/hooks/use-polling-effect";

const VideoQueueManager = () => {
  const [cidQueue, setCIDQueue] = useState<string[]>([]);
  const [currentCID, setCurrentCID] = useState<string | null>(null);
  const lastProcessedCIDs = useRef<string[]>([]);

  const {
    completeCaptionVideo,
    getIncompleteVideoCaptionTasks,
    getIncompleteVideoCaptionTasksDeps,
  } = useCrystalRohrProtocol();

  const fetchIncompleteTasks = async () => {
    try {
      const incompleteTasks = await getIncompleteVideoCaptionTasks();
      console.log(incompleteTasks);

      // Filter out CIDs that are in the last 3 processed CIDs
      const filteredTasks = incompleteTasks.filter(
        (task) => !lastProcessedCIDs.current.includes(task.ipfs_hash)
      );

      // Update the queue with the new filtered tasks
      setCIDQueue(filteredTasks.map((task) => task.ipfs_hash));
    } catch (error) {
      console.error("Error fetching incomplete tasks:", error);
    }
  };

  const [stopPolling, startPolling] = usePollingEffect(
    fetchIncompleteTasks,
    [...getIncompleteVideoCaptionTasksDeps],
    { interval: 25_000 } // Poll every 25 seconds
  );

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  useEffect(() => {
    if (cidQueue.length > 0 && !currentCID) {
      const nextCID = cidQueue[0];
      setCurrentCID(nextCID);
      setCIDQueue((prevQueue) => prevQueue.slice(1));

      // Update the last processed CIDs
      lastProcessedCIDs.current = [
        nextCID,
        ...lastProcessedCIDs.current.slice(0, 2),
      ];
    }
  }, [cidQueue, currentCID]);

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
        toast.success("Caption Job Successful");
      } catch (error) {
        console.error("Error completing video caption:", error);
      }
    }
    setCurrentCID(null);
  };

  return (
    <div>
      {currentCID && (
        <AudioVideoMiner cid={currentCID} onComplete={handleMiningComplete} />
      )}
      <div>
        <h3>Upcoming Videos:</h3>
        <ul>
          {cidQueue.map((cid, index) => (
            <li key={index}>{cid}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoQueueManager;
