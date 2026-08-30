import "server-only";
import { prisma } from "@/lib/prisma";

export type MarkupMode = "flat" | "percent";
export type MarkupSetting = { mode: MarkupMode; value: number };

// Default matches requirement 1 (flat +150 taka) until an admin changes it
// from /admin/settings.
const DEFAULT_MARKUP: MarkupSetting = { mode: "flat", value: 150 };

// AppSetting is a generic key-value store (not a fixed-column Settings
// table) so future settings don't need another migration — markup is
// currently the only thing stored in it.
export async function getMarkupSetting(): Promise<MarkupSetting> {
  const rows = await prisma.appSetting.findMany({
    where: { key: { in: ["markupMode", "markupValue"] } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const mode = byKey.get("markupMode");
  const value = Number(byKey.get("markupValue"));
  return {
    mode: mode === "percent" ? "percent" : DEFAULT_MARKUP.mode,
    value: Number.isFinite(value) && value >= 0 ? value : DEFAULT_MARKUP.value,
  };
}

// Changing this only ever affects candidates found AFTER the change —
// already-approved live Product rows keep their original price, so a
// markup edit never silently reprices something a customer is already
// browsing/carting.
export async function setMarkupSetting(setting: MarkupSetting): Promise<void> {
  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: "markupMode" },
      update: { value: setting.mode },
      create: { key: "markupMode", value: setting.mode },
    }),
    prisma.appSetting.upsert({
      where: { key: "markupValue" },
      update: { value: String(setting.value) },
      create: { key: "markupValue", value: String(setting.value) },
    }),
  ]);
}

export function applyMarkup(realPrice: number, setting: MarkupSetting): number {
  return Math.max(
    1,
    setting.mode === "percent"
      ? Math.round(realPrice * (1 + setting.value / 100))
      : Math.round(realPrice + setting.value)
  );
}
