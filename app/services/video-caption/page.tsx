"use client";

import { ChevronRight, Upload, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/atoms/button";
import SpeechControls from "@/components/molecules/speech-controls";
import VideoPlayer from "@/components/molecules/video-player";
import useFileUpload from "@/hooks/use-file-upload";
import { useUserService } from "@/hooks/use-user-service";

const VideoProcessingPage = () => {
  const [encryptedJob, setEncryptedJob] = useState(false);
  const [nodeAddress, setNodeAddress] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [captionGenerated, setCaptionGenerated] = useState(false);
  const [captionText, setCaptionText] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");

  const { file, setFile, url, setUrl, uploading, uploadFile, handleChange } =
    useFileUpload();
  const {
    uploadVideo,
    getVideoDetails,
    createJob,
    getJobStatus,
    cancelJob,
    getJobDetails,
    getUserJobs,
    createDispute,
    videoId,
    jobId,
    setJobId,
  } = useUserService();

  const inputFile = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async () => {
    const uploadedUrl = await uploadFile();
    if (uploadedUrl) {
      try {
        uploadVideo();
        toast.success("Video uploaded successfully");
      } catch (error) {
        toast.error("Error uploading video");
      }
    } else {
      toast.error("Error uploading file");
    }
  }, [uploadFile, uploadVideo]);

  const handleGenerateCaption = useCallback(async () => {
    if (!videoId) {
      toast.error("No video uploaded");
      return;
    }
    try {
      setStartTime(Date.now());
      toast.success("Caption generation job created");
      setCaptionGenerated(true);
    } catch (error) {
      toast.error("Error creating caption generation job");
    }
  }, [videoId]);

  const handleJobAction = useCallback(
    async (action: () => Promise<any>, successMessage: string) => {
      if (!jobId) {
        toast.error("No active job");
        return;
      }
      try {
        await action();
        toast.success(successMessage);
      } catch (error) {
        toast.error(`Error: ${successMessage.toLowerCase()}`);
      }
    },
    [jobId]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(
          `${Math.floor(elapsed / 60)}:${(elapsed % 60)
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const fetchSummary = async () => {
      // If we haven't returned by now, schedule another attempt
      setTimeout(fetchSummary, 2000);
    };

    fetchSummary();
  }, [captionGenerated]);

  const parsedSummary = useMemo(() => {
    try {
      const parsed = JSON.parse(summary);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        return [summary];
      }
    } catch (error) {
      if (summary.trim() === "") {
        return ["Error: Empty summary"];
      } else {
        return [summary];
      }
    }
  }, [summary]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-12 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
          Video Processing Hub
        </span>
      </h1>

      <div className="mx-auto flex flex-col items-center justify-center">
        {/* Video Upload Section */}
        <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg max-w-2xl w-full">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Upload className="mr-2" /> Upload Your Video
          </h2>
          {!file ? (
            <div className="bg-black bg-opacity-30 rounded-xl p-6">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#550EFB] border-dashed rounded-lg cursor-pointer hover:bg-[#550EFB] hover:bg-opacity-10 transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-[#550EFB]" />
                  <p className="mb-2 text-sm">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    MP4, AVI, or MOV (MAX. 800MB)
                  </p>
                </div>
                <input
                  id="video-upload"
                  type="file"
                  ref={inputFile}
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="mb-2 text-sm">
                {file.name} will be uploaded.{" "}
                <span className="font-semibold">
                  Click &quot;Upload&quot; to start, or cancel
                </span>
              </p>
              {!uploading && (
                <X
                  className="w-5 h-5 self-end cursor-pointer"
                  onClick={() => {
                    setUrl("");
                    setFile(null);
                  }}
                />
              )}
            </div>
          )}
          {uploading && <p className="mt-6">Uploading...</p>}
          {url && <VideoPlayer url={url} />}
          {!url && (
            <Button
              disabled={!file || uploading}
              onClick={handleUpload}
              className="w-full bg-[#1f0a4f] transition-colors duration-300 mt-8 hover:bg-[#360C99]"
            >
              Upload Video <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button
            disabled={!file || uploading}
            onClick={handleGenerateCaption}
            className="w-full bg-[#1f0a4f] transition-colors duration-300 mt-4 hover:bg-[#360C99]"
          >
            Generate Caption <ChevronRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Caption Generation Progress and Results */}
          {captionGenerated && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Caption Generation Progress
              </h3>
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">
                  Generated Summary:
                </h4>
                {summary ? (
                  <div className="space-y-4">
                    {parsedSummary.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}

                    <SpeechControls text={parsedSummary.join(" ")} />
                  </div>
                ) : (
                  <p>Generating summary...</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VideoProcessingPage;
