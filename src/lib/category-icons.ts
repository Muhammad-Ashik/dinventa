import {
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  HomeIcon,
  SparklesIcon,
  TrophyIcon,
  BookOpenIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

// Keyed by category slug (from prisma/seed.ts) rather than name — slugs are
// stable identifiers, names are just display text. Falls back to a plain
// tag icon for any slug not listed here.
export const CATEGORY_ICONS: Record<string, typeof TagIcon> = {
  electronics: DevicePhoneMobileIcon,
  fashion: ShoppingBagIcon,
  "home-lifestyle": HomeIcon,
  "beauty-personal-care": SparklesIcon,
  "sports-outdoors": TrophyIcon,
  "books-stationery": BookOpenIcon,
};

export const DEFAULT_CATEGORY_ICON = TagIcon;

export function categoryIcon(slug: string) {
  return CATEGORY_ICONS[slug] ?? DEFAULT_CATEGORY_ICON;
}
