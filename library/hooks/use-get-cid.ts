import { useCallback, useEffect, useState } from "react";

interface SignedUrlResponse {
  url: string;
  data: Blob | object | string;
  contentType: string | null;
}

export const useGetCID = () => {
  const [blobURL, setBlobURL] = useState<string>("");

  useEffect(() => {
    return () => {
      if (blobURL) {
        URL.revokeObjectURL(blobURL);
      }
    };
  }, [blobURL]);

  const getCidData = useCallback(
    async (cid: string): Promise<SignedUrlResponse | undefined> => {
      try {
        const response = await fetch("/api/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cid }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const signedUrl: string = await response.json();

        const request = await fetch(
          `https://cors-anywhere-brbw.onrender.com/${signedUrl}`
        );

        if (!request.ok) {
          const errorData = await request.text();
          if (request.status === 401 || request.status === 403) {
            throw new Error(`Authentication Failed: ${errorData}`);
          }
          throw new Error(`HTTP error: ${errorData}`);
        }

        const contentType = request.headers.get("content-type");

        let data: Blob | object | string;
        if (contentType?.includes("application/json")) {
          data = await request.json();
        } else if (contentType?.includes("text/")) {
          data = await request.text();
        } else {
          data = await request.blob();
        }

        if (data instanceof Blob) {
          const url = URL.createObjectURL(data);
          setBlobURL(url);
          return { url, data, contentType };
        } else {
          return { url: "", data, contentType };
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        throw error;
      }
    },
    []
  );

  return { getCidData };
};
