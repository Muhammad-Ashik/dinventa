"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { canReviewProduct } from "@/lib/reviews";
import { ReviewFormSchema, type ReviewFormState } from "@/lib/definitions";

export async function submitReview(
  productSlug: string,
  productId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await verifySession();

  const validatedFields = ReviewFormSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  // Re-check server-side regardless of what the form rendered — the client
  // state could be stale (e.g. the tab was open before the order shipped).
  const eligible = await canReviewProduct(session.userId, productId);
  if (!eligible) {
    return { message: "You can only review products from a shipped order you haven't reviewed yet." };
  }

  await prisma.review.create({
    data: {
      userId: session.userId,
      productId,
      rating: validatedFields.data.rating,
      comment: validatedFields.data.comment || null,
    },
  });

  revalidatePath(`/products/${productSlug}`);
  revalidatePath("/");
  return { message: "Thanks for your review!" };
}
