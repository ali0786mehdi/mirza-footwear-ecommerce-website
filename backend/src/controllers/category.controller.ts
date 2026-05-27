import { Request, Response } from "express";
import asyncWrapper from "../utils/asyncWrapper.utils";
import { sendSuccess } from "../utils/apiResponse.utils";
import {
  getAllCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";

export const getAllCategories = asyncWrapper(
  async (_req: Request, res: Response): Promise<void> => {
    const categories = await getAllCategoriesService();
    sendSuccess(res, "Categories fetched successfully", { categories });
  }
);

export const createCategory = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const category = await createCategoryService(req.body);
    sendSuccess(res, "Category created successfully", { category }, 201);
  }
);

export const updateCategory = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
   const category = await updateCategoryService(req.params.id as string, req.body);
    sendSuccess(res, "Category updated successfully", { category });
  }
);

export const deleteCategory = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    await deleteCategoryService(req.params.id as string);
    sendSuccess(res, "Category deleted successfully");
  }
);