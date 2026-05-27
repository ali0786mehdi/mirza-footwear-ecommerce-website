import Category, { ICategory } from "../models/Category.model";
import slugify from "slugify";

export const getAllCategoriesService = async (): Promise<ICategory[]> => {
  return Category.find({ isActive: true }).sort({ name: 1 });
};

export const createCategoryService = async (data: {
  name: string;
  description?: string;
  image?: string;
}): Promise<ICategory> => {
  const existing = await Category.findOne({ name: data.name });
  if (existing) {
    const error = new Error("Category already exists") as Error & {
      statusCode: number;
    };
    error.statusCode = 409;
    throw error;
  }

  const slug = slugify(data.name, { lower: true, strict: true });
  return Category.create({ ...data, slug });
};

export const updateCategoryService = async (
  id: string,
  data: { name?: string; description?: string; image?: string; isActive?: boolean }
): Promise<ICategory> => {
  if (data.name) {
    (data as Record<string, unknown>).slug = slugify(data.name, {
      lower: true,
      strict: true,
    });
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!category) {
    const error = new Error("Category not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  return category;
};

export const deleteCategoryService = async (id: string): Promise<void> => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    const error = new Error("Category not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }
};