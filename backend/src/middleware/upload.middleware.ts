import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Store files in memory as Buffer — goes straight to Cloudinary
const storage = multer.memoryStorage();

// Only allow image files
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WebP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

// For uploading multiple product images (max 5)
export const uploadProductImages = upload.array("images", 5);

// For uploading a single avatar
export const uploadAvatar = upload.single("avatar");

export default upload;