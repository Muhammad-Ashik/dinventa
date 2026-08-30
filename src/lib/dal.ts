import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/session";

export const verifySession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) {
    redirect("/login");
  }
  return { userId: session.userId, role: session.role };
});

export const getOptionalSession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  return { userId: session.userId, role: session.role };
});

export const getCurrentUser = cache(async () => {
  const session = await getOptionalSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
});

export const verifyAdmin = cache(async () => {
  const session = await verifySession();
  if (session.role !== "ADMIN") {
    redirect("/");
  }
  return session;
});
