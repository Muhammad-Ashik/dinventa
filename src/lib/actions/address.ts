"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { AddressFormSchema, AddressFormState } from "@/lib/definitions";

export async function saveAddress(
  type: "SHIPPING" | "BILLING",
  _state: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await verifySession();

  const validatedFields = AddressFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.address.upsert({
    where: { userId_type: { userId: session.userId, type } },
    update: validatedFields.data,
    create: { ...validatedFields.data, type, userId: session.userId },
  });

  revalidatePath("/account/addresses");
  return { message: "Address saved." };
}
