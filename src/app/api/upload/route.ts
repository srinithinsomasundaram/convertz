import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    console.log("Upload started...");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const conversionId = formData.get("conversionId") as string;

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Sending to Cloudinary...");
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: conversionId,
          folder: "conversions",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary stream error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload successful");
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });

    return NextResponse.json(uploadResponse);
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
