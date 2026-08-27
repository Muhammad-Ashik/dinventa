import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.email("Please enter a valid email.").trim(),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const LoginFormSchema = z.object({
  email: z.email("Please enter a valid email.").trim(),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const AiSearchRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required.").max(300, "Keep it under 300 characters."),
});

export const CheckoutFormSchema = z.object({
  shippingAddress: z.string().trim().min(5, "Please enter a full shipping address."),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
});

export type CheckoutFormState =
  | {
      errors?: {
        shippingAddress?: string[];
        phone?: string[];
      };
      message?: string;
    }
  | undefined;

export const ManualProductFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter a product name."),
  description: z.string().trim().min(10, "Please enter a longer description."),
  price: z.coerce.number().int().positive("Price must be a positive whole number of taka."),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  brand: z.string().trim().min(1, "Please enter a brand (or \"Generic\")."),
  categoryId: z.string().trim().min(1, "Please choose a category."),
  imageUrl: z.union([z.url("Please enter a valid image URL."), z.literal("")]).optional(),
});

export type ManualProductFormState =
  | {
      errors?: {
        name?: string[];
        description?: string[];
        price?: string[];
        stock?: string[];
        brand?: string[];
        categoryId?: string[];
        imageUrl?: string[];
      };
      message?: string;
    }
  | undefined;
