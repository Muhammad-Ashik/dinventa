import * as z from "zod";

export const SignupFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long."),
    email: z.email("Please enter a valid email.").trim(),
    phone: z.string().trim().min(6, "Please enter a valid phone number."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        password?: string[];
        confirmPassword?: string[];
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

export const ProfileFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
});

export type ProfileFormState =
  | {
      errors?: {
        name?: string[];
        phone?: string[];
      };
      message?: string;
    }
  | undefined;

export const ChangePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, "Please enter your current password."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match.",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormState =
  | {
      errors?: {
        oldPassword?: string[];
        newPassword?: string[];
        confirmNewPassword?: string[];
      };
      message?: string;
    }
  | undefined;

export const AddressFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.email("Please enter a valid email.").trim(),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
  address: z.string().trim().min(5, "Please enter a full address."),
});

export type AddressFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        address?: string[];
      };
      message?: string;
    }
  | undefined;

export const ManualProductFormSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter a product name."),
    description: z.string().trim().min(10, "Please enter a longer description."),
    price: z.coerce.number().int().positive("Price must be a positive whole number of taka."),
    // "Was" price for a genuine discount — optional; empty string means no
    // discount, not zero (an empty HTML number input submits as "").
    compareAtPrice: z
      .union([z.coerce.number().int().positive(), z.literal("")])
      .optional(),
    // Real end time for a genuine time-boxed sale — optional, only
    // meaningful alongside compareAtPrice. Empty string means no deadline
    // (a plain ongoing discount), not "expired". Comes from a
    // datetime-local input, so validated as "is this a parseable date"
    // rather than a strict ISO format.
    saleEndsAt: z
      .union([z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date."), z.literal("")])
      .optional(),
    stock: z.coerce.number().int().min(0, "Stock can't be negative."),
    brand: z.string().trim().min(1, "Please enter a brand (or \"Generic\")."),
    categoryId: z.string().trim().min(1, "Please choose a category."),
    imageUrl: z.union([z.url("Please enter a valid image URL."), z.literal("")]).optional(),
  })
  .refine(
    (data) => !data.compareAtPrice || data.compareAtPrice > data.price,
    {
      message: "Original price must be higher than the sale price.",
      path: ["compareAtPrice"],
    }
  );

export type ManualProductFormState =
  | {
      errors?: {
        name?: string[];
        description?: string[];
        price?: string[];
        compareAtPrice?: string[];
        saleEndsAt?: string[];
        stock?: string[];
        brand?: string[];
        categoryId?: string[];
        imageUrl?: string[];
      };
      message?: string;
    }
  | undefined;

export const ReviewFormSchema = z.object({
  rating: z.coerce.number().int().min(1, "Please choose a rating.").max(5),
  comment: z.string().trim().max(1000).optional(),
});

export type ReviewFormState =
  | {
      errors?: {
        rating?: string[];
        comment?: string[];
      };
      message?: string;
    }
  | undefined;
