"use client";

import { UploadCloud, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/atoms/button";
import ProgressStripe from "@/components/atoms/progress-stripe";
import SpeechControls from "@/components/molecules/speech-controls";
import VideoPlayer from "@/components/molecules/video-player";
import { useCrystalRohrProtocol } from "@/hooks/use-crystalrohr-protocol";
import useFileUpload from "@/hooks/use-file-upload";
import { useGetCID } from "@/hooks/use-get-cid";

interface FileUploadAreaProps {
  inputFile: React.RefObject<HTMLInputElement>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FileInfoProps {
  file: File;
  setCID: React.Dispatch<React.SetStateAction<string>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  uploading: boolean;
}

interface UploadWithCaptionButtonProps {
  file: File | null;
  cid: string;
  uploading: boolean;
  handleUploadAndGenerateCaption: () => Promise<void>;
}

interface CaptionGenerationSectionProps {
  summary: string;
  parsedSummary: string[];
}

const VideoProcessingPage = () => {
  const [summary, setSummary] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  const { file, setFile, cid, setCID, uploading, uploadFile, handleChange } =
    useFileUpload();

  const { getCidData } = useGetCID();

  const { captionVideo, pollForVideoCaptions } = useCrystalRohrProtocol();

  const inputFile = useRef<HTMLInputElement>(null);

  const handleUploadAndGenerateCaption = useCallback(async () => {
    try {
      const cid = await uploadFile();
      if (!cid) {
        toast.error("Error uploading file");
        return;
      }
      toast.success("Video uploaded successfully");

      await captionVideo(cid);
      toast.success("Caption generation job created");

      const cidData = await getCidData(cid);
      if (cidData?.url) {
        setVideoUrl(cidData.url);
      } else {
        throw new Error("Couldn't load video data");
      }

      const captions = await pollForVideoCaptions(cid);
      if (captions.length > 0) {
        setSummary(captions[0].caption);
        toast.success("Caption generated successfully");
      } else {
        throw new Error("No captions found after all attempts");
      }
    } catch (error) {
      console.error("Error during upload or caption generation:", error);
      toast.error("Error during upload or caption generation");
    }
  }, [uploadFile, captionVideo]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const parsedSummary = summary
    ? (() => {
        try {
          const parsed = JSON.parse(summary);
          return Array.isArray(parsed) ? parsed : [summary];
        } catch (error) {
          return [summary];
        }
      })()
    : ["Error: Empty summary"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-600 to-[#000011] text-white p-8 flex justify-center">
      <div className="flex flex-col p-4 gap-4 w-full max-w-xl">
        <h1 className="font-outfit font-semibold">Video Caption Hub</h1>

        <section className="flex flex-col gap-4 bg-black/20 rounded-2xl p-8 shadow-lg w-full">
          {!file ? (
            <FileUploadArea inputFile={inputFile} handleChange={handleChange} />
          ) : (
            <FileInfo
              file={file}
              setCID={setCID}
              setFile={setFile}
              uploading={uploading}
            />
          )}
          {uploading && <p className="mt-6">Uploading...</p>}
          {videoUrl && <VideoPlayer url={videoUrl} />}
          <UploadWithCaptionButton
            file={file}
            cid={cid}
            uploading={uploading}
            handleUploadAndGenerateCaption={handleUploadAndGenerateCaption}
          />
          {videoUrl &&
            (summary ? (
              <CaptionGenerationSection
                summary={summary}
                parsedSummary={parsedSummary}
              />
            ) : (
              <div className="relative">
                <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center whitespace-nowrap text-slate-800  text-base font-medium">
                  Caption is in Progress
                </p>
                <ProgressStripe percentage={100} />
              </div>
            ))}
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
          <span className="font-semibold">Click to upload</span> use only public
          videos
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

const FileInfo = ({ file, setCID, setFile, uploading }: FileInfoProps) => (
  <div className="flex flex-col items-center justify-center">
    <p className="mb-2 text-sm">
      {file.name} will be uploaded.{" "}
      <span className="font-semibold">Click "Upload" to start, or cancel</span>
    </p>
    {!uploading && (
      <X
        className="w-5 h-5 self-end cursor-pointer"
        onClick={() => {
          setCID("");
          setFile(null);
        }}
      />
    )}
  </div>
);

const UploadWithCaptionButton = ({
  file,
  cid,
  uploading,
  handleUploadAndGenerateCaption,
}: UploadWithCaptionButtonProps) => (
  <>
    {!cid && (
      <Button
        disabled={!file || uploading}
        onClick={handleUploadAndGenerateCaption}
        className="w-full bg-[#02071E] text-white hover:bg-[#1A1E2E] transition-colors duration-200"
      >
        Upload and Generate Caption
      </Button>
    )}
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
