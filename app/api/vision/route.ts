import Anthropic from "@anthropic-ai/sdk";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources/index.mjs";
import { type NextRequest, NextResponse } from "next/server";

import { pinata } from "@/services/pinata";

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const anthropic = new Anthropic();
    const { cids } = await req.json();

    if (!Array.isArray(cids) || cids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty CIDs array" },
        { status: 400 }
      );
    }

    const imageContents: ImageBlockParam[] = (
      await Promise.all(
        cids.map(async (cid) => {
          const file = await pinata.gateways.get(cid);

          if (
            !file.data ||
            !file.contentType ||
            !SUPPORTED_IMAGE_TYPES.includes(
              file.contentType as SupportedImageType
            )
          ) {
            console.log(`Skipping unsupported content type for CID: ${cid}`);
            return null;
          }

          let base64Data: string;

          if (file.data instanceof Blob) {
            const arrayBuffer = await file.data.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString("base64");
          } else if (typeof file.data === "string") {
            base64Data = Buffer.from(file.data).toString("base64");
          } else if (file.data instanceof Object) {
            console.log(`Unexpected Object data type for image CID: ${cid}`);
            return null;
          } else {
            console.log(`Unsupported data type for CID: ${cid}`);
            return null;
          }

          return {
            type: "image",
            source: {
              type: "base64",
              media_type: file.contentType as SupportedImageType,
              data: base64Data,
            },
          };
        })
      )
    ).filter((content): content is ImageBlockParam => content !== null);

    if (imageContents.length === 0) {
      return NextResponse.json(
        { error: "No valid image content found" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: imageContents,
        },
      ],
    });

    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing images with Anthropic API" },
      { status: 500 }
    );
  }
}
