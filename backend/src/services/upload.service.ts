import cloudinary from "../integrations/cloudinary";
import { UploadApiResponse } from "cloudinary";

// Upload a single image buffer to Cloudinary
// Returns the secure URL and public_id
export const uploadImage = (
  fileBuffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `mirza-footwear/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: "limit" }, // max 800x800
          { quality: "auto" },                         // auto compress
          { fetch_format: "auto" },                    // auto webp/avif
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed — no result"));
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Upload multiple images at once
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) =>
    uploadImage(file.buffer, folder)
  );
  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.secure_url);
};

// Delete image from Cloudinary using its public_id
// public_id is extracted from the URL
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud/image/upload/v123/mirza-footwear/products/abc123.jpg
    const parts = imageUrl.split("/");
    const fileWithExt = parts[parts.length - 1];
    const fileName = fileWithExt.split(".")[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileName}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log but don't throw — image deletion failure shouldn't crash the request
    console.error("Failed to delete image from Cloudinary:", error);
  }
};