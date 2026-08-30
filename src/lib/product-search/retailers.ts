import "server-only";
import { prisma } from "@/lib/prisma";

// Vetted retailers live in the DB (VettedRetailer model), not a hardcoded
// list, so an admin can add/deactivate one from /admin/settings without a
// code change. Every row was manually checked for a clean robots.txt and no
// anti-scraping ToS clause before being added — see the project plan's
// Phase 5 notes and BANNED_DOMAINS in ./types.ts for the hard safety net.
export async function getVettedRetailersForCategory(categoryId: string) {
  return prisma.vettedRetailer.findMany({
    where: { categoryId, active: true },
    orderBy: { name: "asc" },
  });
}
