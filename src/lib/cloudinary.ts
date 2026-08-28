import { v2 as cloudinary } from "cloudinary";

// Vibecode learning: Cloudinary Free 25GB — we store ONLY URLs in Postgres (Product.images Json), not blobs.
// This keeps Supabase 500MB DB tiny. Upload via Server Action → return secure_url.

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

// Helper to build optimized URL (auto format + quality)
export function cloudinaryUrl(publicId: string, opts?: { w?: number; h?: number }) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return "";
  const transforms = [`f_auto`, `q_auto`];
  if (opts?.w) transforms.push(`w_${opts.w}`);
  if (opts?.h) transforms.push(`h_${opts.h}`);
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms.join(",")}/${publicId}`;
}

// Extract publicId from a full Cloudinary URL (for deletions)
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/);
  return match ? match[1] : null;
}
