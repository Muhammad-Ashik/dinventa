import "server-only";
import type { CourierService } from "@/lib/courier/types";
import { mockCourierService } from "@/lib/courier/mock";

// Dynamically imported rather than a plain top-level import, same reason as
// src/lib/calls/index.ts: steadfast.ts reads env vars at call time (not
// module scope, so it's safe either way here), but keeping the pattern
// consistent avoids surprises if that ever changes.
export async function getCourierService(): Promise<CourierService> {
  const isSteadfastConfigured =
    !!process.env.STEADFAST_API_KEY && !!process.env.STEADFAST_SECRET_KEY;

  if (!isSteadfastConfigured) return mockCourierService;

  const { steadfastCourierService } = await import("@/lib/courier/steadfast");
  return steadfastCourierService;
}
