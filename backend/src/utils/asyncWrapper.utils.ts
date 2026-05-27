import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Wraps any async controller function and catches errors automatically
// Instead of try/catch in every controller, just wrap with asyncWrapper
const asyncWrapper = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next); // catches any thrown error → errorHandler middleware
  };
};

export default asyncWrapper;