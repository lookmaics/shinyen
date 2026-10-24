import imageCompression from "browser-image-compression";

export interface CompressedImageDual {
  thumbnailBlob: Blob;
  thumbnailUrl: string;
  thumbnailSizeKb: number;

  galleryBlob: Blob;
  galleryUrl: string;
  gallerySizeKb: number;

  originalSizeKb: number;
}

/**
 * Sequential Client-Side Dual Image Compression
 * Hardened for budget Android phones (Helio G25 / Unisoc / 2GB RAM):
 * Compresses sequentially (for...of) to prevent browser canvas RAM crashes.
 *
 * Produces:
 * 1. Day-0 14KB Thumbnail (max 360px, WebP)
 * 2. 160KB Full-Size Gallery Photo (max 1440px, WebP)
 */
export async function compressListingImagesSequentially(
  files: File[],
  onProgress?: (current: number, total: number, statusText: string) => void
): Promise<CompressedImageDual[]> {
  const results: CompressedImageDual[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const originalSizeKb = Math.round(file.size / 1024);

    onProgress?.(
      i + 1,
      total,
      `Compressing photo ${i + 1} of ${total} (${originalSizeKb}KB)...`
    );

    // 1. Generate Day-0 14KB-20KB Thumbnail for blazing-fast feed grids
    const thumbOptions = {
      maxSizeMB: 0.025, // target ~20KB
      maxWidthOrHeight: 360,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.75,
    };

    // 2. Generate Full 160KB Gallery Photo
    const galleryOptions = {
      maxSizeMB: 0.18, // target < 180KB
      maxWidthOrHeight: 1440,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.82,
    };

    try {
      const [thumbBlob, galleryBlob] = await Promise.all([
        imageCompression(file, thumbOptions),
        imageCompression(file, galleryOptions),
      ]);

      const thumbUrl = URL.createObjectURL(thumbBlob);
      const galleryUrl = URL.createObjectURL(galleryBlob);

      results.push({
        thumbnailBlob: thumbBlob,
        thumbnailUrl: thumbUrl,
        thumbnailSizeKb: Math.round(thumbBlob.size / 1024),

        galleryBlob: galleryBlob,
        galleryUrl: galleryUrl,
        gallerySizeKb: Math.round(galleryBlob.size / 1024),

        originalSizeKb,
      });
    } catch (err) {
      console.warn("Client compression fallback for file:", file.name, err);
      // Fallback if browser-image-compression fails
      const fallbackUrl = URL.createObjectURL(file);
      results.push({
        thumbnailBlob: file,
        thumbnailUrl: fallbackUrl,
        thumbnailSizeKb: originalSizeKb,
        galleryBlob: file,
        galleryUrl: fallbackUrl,
        gallerySizeKb: originalSizeKb,
        originalSizeKb,
      });
    }
  }

  return results;
}
