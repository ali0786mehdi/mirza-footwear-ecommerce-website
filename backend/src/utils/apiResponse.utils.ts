import { Response } from "express";

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

export const sendSuccess = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode: number = 200
): Response<ApiResponseData> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error: unknown = null
): Response<ApiResponseData> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error : undefined,
  });
};