import { useEffect, useState } from "react";
import { toast } from "sonner";

import AudioVideoMiner from "@/components/molecules/audio-video-miner";
import { useCrystalRohrProtocol } from "@/hooks/use-crystalrohr-protocol";
import usePollingEffect from "@/hooks/use-polling-effect";

const VideoQueueManager = () => {
  const [cidQueue, setCIDQueue] = useState<Set<string>>(new Set());
  const [currentCID, setCurrentCID] = useState<string | null>(null);

  const {
    completeCaptionVideo,
    getIncompleteVideoCaptionTasks,
    getIncompleteVideoCaptionTasksDeps,
  } = useCrystalRohrProtocol();

  console.log("called out");

  const fetchIncompleteTasks = async () => {
    console.log("called");

    try {
      const incompleteTasks = await getIncompleteVideoCaptionTasks();
      console.log(incompleteTasks);
      setCIDQueue((prevQueue) => {
        const newQueue = new Set(prevQueue);
        incompleteTasks.forEach((task) => {
          newQueue.add(task.ipfs_hash);
        });
        return newQueue;
      });
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
    if (cidQueue.size > 0 && !currentCID) {
      const nextCID = Array.from(cidQueue)[0];
      setCurrentCID(nextCID);
      setCIDQueue((prevQueue) => {
        const newQueue = new Set(prevQueue);
        newQueue.delete(nextCID);
        return newQueue;
      });
    }
  }, [cidQueue, currentCID]);

  const handleMiningComplete = async (
    capturedImages: string[],
    extractedAudio: Blob
  ) => {
    if (currentCID) {
      try {
        const formData = new FormData();
        formData.append("audio", extractedAudio); // audioFile should be a File or Blob object
        formData.append("model_id", "your_model_id_here"); // Replace with actual model ID

        const options = {
          method: "POST",
          headers: {
            Authorization: "Bearer <token>",
            // Don't set Content-Type header, it will be set automatically
          },
          body: formData,
        };

        fetch("https://dream-gateway.livepeer.cloud/audio-to-text", options)
          .then((response) => response.json())
          .then((response) => console.log(response))
          .catch((err) => console.error(err));
        const audioSummary = "TODO";
        const message = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ capturedImages, audioSummary }),
        }).then((res) => res.json());
        await completeCaptionVideo(message);
        toast.success("Caption Job Successful");
      } catch (error) {
        console.error("Error completing video caption:", error);
      }
    }
    setCurrentCID(null);
  };

  return (
    <div>
      <h2>Video Queue Manager</h2>
      {currentCID && (
        <AudioVideoMiner cid={currentCID} onComplete={handleMiningComplete} />
      )}
      <div>
        <h3>Upcoming Videos:</h3>
        <ul>
          {Array.from(cidQueue).map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoQueueManager;
