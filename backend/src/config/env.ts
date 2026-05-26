import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};