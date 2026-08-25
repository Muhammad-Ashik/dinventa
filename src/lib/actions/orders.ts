"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { CheckoutFormSchema } from "@/lib/definitions";
import { getCallService } from "@/lib/calls";

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  shippingAddress: string;
  phone: string;
};

export type CheckoutResult =
  | { orderId: string }
  | { error: string; fieldErrors?: Record<string, string[]> };

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const session = await verifySession();

  const validatedFields = CheckoutFormSchema.safeParse({
    shippingAddress: input.shippingAddress,
    phone: input.phone,
  });
  if (!validatedFields.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (!input.items?.length) {
    return { error: "Your cart is empty." };
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = productById.get(item.productId);
    if (!product) {
      return { error: "One of the items in your cart is no longer available." };
    }
    if (item.quantity < 1 || product.stock < item.quantity) {
      return { error: `Not enough stock for "${product.name}".` };
    }
  }

  const totalAmount = input.items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.userId,
        totalAmount,
        shippingAddress: validatedFields.data.shippingAddress,
        phone: validatedFields.data.phone,
        items: {
          create: input.items.map((item) => {
            const product = productById.get(item.productId)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
    });

    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  try {
    const callService = await getCallService();
    await callService.initiateConfirmationCall({ id: order.id, phone: order.phone });
  } catch (error) {
    // A call-placement failure shouldn't fail checkout — the order still
    // exists and can be confirmed manually from /admin.
    console.error(`Failed to initiate confirmation call for order ${order.id}:`, error);
  }

  return { orderId: order.id };
}
