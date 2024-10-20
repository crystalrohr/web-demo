import { useEffect, useState } from "react";

import Canvas from "@/components/molecules/canvas";
import useCaptureStills from "@/hooks/use-capture-stills";
import { useGetCID } from "@/hooks/use-get-cid";

interface AudioVideoMinerProps {
  cid: string;
  onComplete: (capturedImages: string[], extractedAudio: Blob) => void;
}

const AudioVideoMiner = ({
  cid,
  onComplete,
}: AudioVideoMinerProps): JSX.Element => {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { getCidData } = useGetCID();
  const {
    canvasRef,
    captureSliced,
    sceneRef,
    videoRef,
    slicedRef,
    stopPolling,
    startPolling,
    capturedImages,
    capturedScenes,
    processStatus,
    lastEvent,
  } = useCaptureStills();

  useEffect(() => {
    if (lastEvent === "all_complete") {
      onComplete(capturedImages, new Blob([], { type: "audio/mpeg" }));
    }
  }, [lastEvent, processStatus, capturedImages, onComplete]);

  useEffect(() => {
    if (cid) {
      startPolling();
      getCidData(cid).then((response) => {
        if (response?.url) {
          setVideoUrl(response.url);
        } else {
          // TODO: onError
          alert("video url didn't load");
        }
      });
    }
    return () => {
      stopPolling();
    };
  }, [cid, startPolling, stopPolling, getCidData]);

  return (
    <div>
      <Canvas {...{ canvasRef }} />

      <div className="mb-4">
        <button
          onClick={() => setIsVideoVisible(!isVideoVisible)}
          className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
        >
          {isVideoVisible ? "Hide Video Player" : "Show Video Player"}
        </button>
      </div>

      {videoUrl && (
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
              autoPlay
              preload="none"
              width="560px"
              height="315px"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>

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
  );
};

export default AudioVideoMiner;
