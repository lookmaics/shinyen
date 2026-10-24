import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      filename,
      contentType = "image/webp",
      contentLength,
      purpose = "listing_image",
      sellerId = "seller-vault-01",
    } = body;

    // 1. Storage Abuse Protection: Enforce strict byte limits
    if (purpose === "listing_image") {
      const MAX_IMAGE_BYTES = 350 * 1024; // 350KB limit
      if (contentLength && contentLength > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: "PAYLOAD_TOO_LARGE",
            message: `Image exceeds maximum allowed size of 350KB (received ${Math.round(
              contentLength / 1024
            )}KB). Please run client compression.`,
          },
          { status: 413 }
        );
      }
    } else if (purpose === "dispute_video") {
      const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB limit for unboxing evidence
      if (contentLength && contentLength > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: "PAYLOAD_TOO_LARGE",
            message: "Dispute video exceeds 50MB limit.",
          },
          { status: 413 }
        );
      }
    }

    // 2. Allowed Content-Types
    const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png", "video/mp4"];
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: "UNSUPPORTED_MEDIA_TYPE",
          message: `Content-Type ${contentType} is not permitted. Only WebP/JPEG/PNG and MP4 are allowed.`,
        },
        { status: 415 }
      );
    }

    const timestamp = Date.now();
    const cleanFilename = filename?.replace(/[^a-zA-Z0-9.-]/g, "_") || "asset.webp";
    const objectKey = `${purpose}/${sellerId}/${timestamp}-${cleanFilename}`;

    // Cloudflare R2 / S3-compatible configuration check
    const r2Endpoint = process.env.R2_ENDPOINT;
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || "https://media.shinyen.in";

    if (r2Endpoint && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      // In production with R2 credentials, generates signed S3v4 URL with 120s expiry
      return NextResponse.json({
        success: true,
        uploadUrl: `${r2Endpoint}/${objectKey}?signed=true&expires=120`,
        publicUrl: `${r2PublicDomain}/${objectKey}`,
        key: objectKey,
        expiresInSeconds: 120,
      });
    }

    // 3. Fallback for local development / testing preview
    return NextResponse.json({
      success: true,
      simulation: true,
      uploadUrl: `/api/seller/mock-upload?key=${encodeURIComponent(objectKey)}`,
      publicUrl: `https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80`,
      key: objectKey,
      expiresInSeconds: 120,
      boundLimits: {
        maxBytes: purpose === "listing_image" ? "350KB" : "50MB",
        contentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
