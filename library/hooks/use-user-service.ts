import { useState } from "react";

export function useUserService() {
  const [videoId, setVideoId] = useState<bigint | null>(null);
  const [jobId, setJobId] = useState<bigint | null>(null);
  const [nodeId, setNodeId] = useState<bigint | null>(null);

  const uploadVideo = () => {};

  const createJob = () => {};

  const cancelJob = () => {};

  const createDispute = () => {};

  const getVideoDetails = () => {};

  const getJobStatus = () => {};

  const getJobDetails = () => {};

  const getUserJobs = () => {};

  const getNodeDetails = () => {};

  return {
    uploadVideo,
    getVideoDetails,
    createJob,
    getJobStatus,
    setNodeId,
    getNodeDetails,
    cancelJob,
    getJobDetails,
    getUserJobs,
    createDispute,
    videoId,
    setVideoId,
    jobId,
    setJobId,
  };
}
