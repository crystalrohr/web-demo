"use client";

import { UploadCloud, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/atoms/button";
import SpeechControls from "@/components/molecules/speech-controls";
import VideoPlayer from "@/components/molecules/video-player";
import useFileUpload from "@/hooks/use-file-upload";
import { useUserService } from "@/hooks/use-user-service";

interface FileUploadAreaProps {
  inputFile: React.RefObject<HTMLInputElement>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FileInfoProps {
  file: File;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  uploading: boolean;
}

interface UploadButtonsProps {
  file: File | null;
  url: string;
  uploading: boolean;
  handleUpload: () => Promise<void>;
  handleGenerateCaption: () => Promise<void>;
}

interface CaptionGenerationSectionProps {
  summary: string;
  parsedSummary: string[];
}

const VideoProcessingPage = () => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [captionGenerated, setCaptionGenerated] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("");

  const { file, setFile, url, setUrl, uploading, uploadFile, handleChange } =
    useFileUpload();
  const { uploadVideo, videoId } = useUserService();

  const inputFile = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async () => {
    const uploadedUrl = await uploadFile();
    if (uploadedUrl) {
      try {
        await uploadVideo();
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
      // Implement summary fetching logic here
      setTimeout(fetchSummary, 2000);
    };

    if (captionGenerated) {
      fetchSummary();
    }
  }, [captionGenerated]);

  const parsedSummary = summary
    ? Array.isArray(JSON.parse(summary))
      ? JSON.parse(summary)
      : [summary]
    : ["Error: Empty summary"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-600 to-[#000011] text-white p-8 flex justify-center">
      <div className="flex flex-col p-4 gap-4 w-full max-w-xl">
        <h1 className="font-outfit font-semibold">Video Processing Hub</h1>

        <section className="flex flex-col gap-4 bg-black/20 rounded-2xl p-8 shadow-lg w-full">
          {!file ? (
            <FileUploadArea inputFile={inputFile} handleChange={handleChange} />
          ) : (
            <FileInfo
              file={file}
              setUrl={setUrl}
              setFile={setFile}
              uploading={uploading}
            />
          )}
          {uploading && <p className="mt-6">Uploading...</p>}
          {url && <VideoPlayer url={url} />}
          <UploadButtons
            file={file}
            url={url}
            uploading={uploading}
            handleUpload={handleUpload}
            handleGenerateCaption={handleGenerateCaption}
          />
          {captionGenerated && (
            <CaptionGenerationSection
              summary={summary}
              parsedSummary={parsedSummary}
            />
          )}
        </section>
      </div>
    </div>
  );
};

const FileUploadArea = ({ inputFile, handleChange }: FileUploadAreaProps) => (
  <div className="bg-black bg-opacity-30 rounded-xl p-6">
    <label
      htmlFor="video-upload"
      className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#012d2d] border-dashed rounded-lg cursor-pointer hover:bg-[#22bcbc] hover:bg-opacity-10 transition-all duration-300"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-10 h-10 mb-3 text-[#069a9a]" />
        <p className="mb-2 text-sm">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-400">MP4, AVI, or MOV (MAX. 800MB)</p>
      </div>
      <input
        id="video-upload"
        type="file"
        ref={inputFile}
        className="hidden"
        onChange={handleChange}
        accept="video/mp4,video/x-m4v,video/*"
      />
    </label>
  </div>
);

const FileInfo = ({ file, setUrl, setFile, uploading }: FileInfoProps) => (
  <div className="flex flex-col items-center justify-center">
    <p className="mb-2 text-sm">
      {file.name} will be uploaded.{" "}
      <span className="font-semibold">Click "Upload" to start, or cancel</span>
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
);

const UploadButtons = ({
  file,
  url,
  uploading,
  handleUpload,
  handleGenerateCaption,
}: UploadButtonsProps) => (
  <>
    {!url && (
      <Button
        disabled={!file || uploading}
        onClick={handleUpload}
        className="w-full bg-[#02071E] text-white hover:bg-[#1A1E2E] transition-colors duration-200"
      >
        Upload Video
      </Button>
    )}
    <Button
      disabled={!file || uploading}
      onClick={handleGenerateCaption}
      className="w-full bg-[#02071E] text-white hover:bg-[#1A1E2E] transition-colors duration-200"
    >
      Generate Caption
    </Button>
  </>
);

const CaptionGenerationSection = ({
  summary,
  parsedSummary,
}: CaptionGenerationSectionProps) => (
  <div className="mt-8">
    <h3 className="text-xl font-semibold mb-4">Caption Generation Progress</h3>
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-2">Generated Summary:</h4>
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
);

export default VideoProcessingPage;
