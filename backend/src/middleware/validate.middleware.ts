import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 uses .issues instead of .errors
        const errors = error.issues.map((issue) => ({
          field: issue.path.slice(1).join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }
      next(error);
    }
  };

export default validate;