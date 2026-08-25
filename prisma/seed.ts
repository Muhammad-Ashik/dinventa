import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { findProductImageUrl } from "../src/lib/product-image";

const prisma = new PrismaClient();

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Lifestyle", slug: "home-lifestyle" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Books & Stationery", slug: "books-stationery" },
];

const products = [
  // Electronics
  {
    name: "Redragon K552 Mechanical Keyboard",
    slug: "redragon-k552-mechanical-keyboard",
    description:
      "Compact 87-key mechanical keyboard with blue switches and red backlighting.",
    price: 3200,
    stock: 25,
    categorySlug: "electronics",
  },
  {
    name: "Budget Wired Mechanical Keyboard",
    slug: "budget-wired-mechanical-keyboard",
    description: "Entry-level mechanical keyboard, great for a first upgrade under 500 BDT.",
    price: 450,
    stock: 40,
    categorySlug: "electronics",
  },
  {
    name: "Logitech G102 Gaming Mouse",
    slug: "logitech-g102-gaming-mouse",
    description: "Lightweight gaming mouse with RGB lighting and 8000 DPI sensor.",
    price: 1450,
    stock: 30,
    categorySlug: "electronics",
  },
  {
    name: "Wireless Silent Mouse",
    slug: "wireless-silent-mouse",
    description: "Compact wireless mouse with silent clicks, budget friendly.",
    price: 480,
    stock: 50,
    categorySlug: "electronics",
  },
  {
    name: "24-inch Full HD Monitor",
    slug: "24-inch-full-hd-monitor",
    description: "24-inch IPS monitor with 75Hz refresh rate, ideal for work and casual gaming.",
    price: 12500,
    stock: 12,
    categorySlug: "electronics",
  },
  {
    name: "USB Wired Headset",
    slug: "usb-wired-headset",
    description: "Comfortable over-ear headset with noise-cancelling mic.",
    price: 890,
    stock: 35,
    categorySlug: "electronics",
  },
  {
    name: "Bluetooth Portable Speaker",
    slug: "bluetooth-portable-speaker",
    description: "Compact speaker with 10-hour battery life and deep bass.",
    price: 1990,
    stock: 20,
    categorySlug: "electronics",
  },
  {
    name: "RGB Mouse Pad (Large)",
    slug: "rgb-mouse-pad-large",
    description: "Extended desk mat with RGB edge lighting.",
    price: 650,
    stock: 45,
    categorySlug: "electronics",
  },
  {
    name: "Laptop Stand (Aluminum)",
    slug: "laptop-stand-aluminum",
    description: "Adjustable aluminum laptop stand for better posture and cooling.",
    price: 1200,
    stock: 18,
    categorySlug: "electronics",
  },

  // Fashion
  {
    name: "Men's Casual Cotton T-Shirt",
    slug: "mens-casual-cotton-tshirt",
    description: "Soft, breathable 100% cotton t-shirt for everyday wear.",
    price: 550,
    stock: 60,
    categorySlug: "fashion",
  },
  {
    name: "Women's Denim Jacket",
    slug: "womens-denim-jacket",
    description: "Classic fit denim jacket, a wardrobe staple for every season.",
    price: 2200,
    stock: 25,
    categorySlug: "fashion",
  },
  {
    name: "Unisex Canvas Sneakers",
    slug: "unisex-canvas-sneakers",
    description: "Lightweight canvas sneakers that go with almost any outfit.",
    price: 1800,
    stock: 32,
    categorySlug: "fashion",
  },

  // Home & Lifestyle
  {
    name: "Ceramic Coffee Mug Set (4-Piece)",
    slug: "ceramic-coffee-mug-set",
    description: "Set of 4 matte-finish ceramic mugs, microwave and dishwasher safe.",
    price: 450,
    stock: 40,
    categorySlug: "home-lifestyle",
  },
  {
    name: "Scented Candle Gift Set",
    slug: "scented-candle-gift-set",
    description: "3-candle gift set in lavender, vanilla, and sandalwood scents.",
    price: 650,
    stock: 28,
    categorySlug: "home-lifestyle",
  },
  {
    name: "Cotton Bedsheet Set (Queen)",
    slug: "cotton-bedsheet-set-queen",
    description: "Queen-size cotton bedsheet with two pillow covers, machine washable.",
    price: 1800,
    stock: 22,
    categorySlug: "home-lifestyle",
  },

  // Beauty & Personal Care
  {
    name: "Herbal Face Wash (100ml)",
    slug: "herbal-face-wash-100ml",
    description: "Gentle daily face wash with neem and aloe vera extracts.",
    price: 320,
    stock: 55,
    categorySlug: "beauty-personal-care",
  },
  {
    name: "Electric Hair Trimmer",
    slug: "electric-hair-trimmer",
    description: "Cordless rechargeable trimmer with multiple length guides.",
    price: 1250,
    stock: 20,
    categorySlug: "beauty-personal-care",
  },
  {
    name: "Moisturizing Body Lotion (200ml)",
    slug: "moisturizing-body-lotion-200ml",
    description: "Non-greasy daily body lotion for soft, hydrated skin.",
    price: 380,
    stock: 48,
    categorySlug: "beauty-personal-care",
  },

  // Sports & Outdoors
  {
    name: "Non-Slip Yoga Mat",
    slug: "non-slip-yoga-mat",
    description: "6mm thick yoga mat with carry strap, non-slip on both sides.",
    price: 900,
    stock: 30,
    categorySlug: "sports-outdoors",
  },
  {
    name: "Adjustable Dumbbell Set (5kg Pair)",
    slug: "adjustable-dumbbell-set-5kg",
    description: "Pair of 5kg adjustable dumbbells for home strength training.",
    price: 2500,
    stock: 15,
    categorySlug: "sports-outdoors",
  },
  {
    name: "Sports Water Bottle (1L)",
    slug: "sports-water-bottle-1l",
    description: "Leak-proof 1-litre bottle with time markers, BPA-free.",
    price: 350,
    stock: 50,
    categorySlug: "sports-outdoors",
  },

  // Books & Stationery
  {
    name: "Bestselling Novel Box Set",
    slug: "bestselling-novel-box-set",
    description: "3-book box set of award-winning contemporary fiction.",
    price: 950,
    stock: 18,
    categorySlug: "books-stationery",
  },
  {
    name: "A5 Notebook Pack (3-Pack)",
    slug: "a5-notebook-pack-3pack",
    description: "Set of 3 ruled A5 notebooks, 120 pages each.",
    price: 280,
    stock: 60,
    categorySlug: "books-stationery",
  },
  {
    name: "Premium Gel Pen Set (10-Pack)",
    slug: "premium-gel-pen-set-10pack",
    description: "Smooth-writing gel pens in assorted colors, 10 per pack.",
    price: 220,
    stock: 70,
    categorySlug: "books-stationery",
  },
];

async function main() {
  // Upsert first so any product still on an old category gets repointed to
  // its new category, *then* clean up whatever's left orphaned — deleting
  // old categories before repointing their products would violate the FK.
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const { categorySlug, ...product } of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });
    const imageUrl = await findProductImageUrl(product.name, product.slug);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, imageUrl, categoryId: category.id },
      create: { ...product, imageUrl, categoryId: category.id },
    });
  }

  // Deliberately no "delete anything not in this file" step: this script
  // runs on every container start (docker-compose.yml), and the catalog now
  // has organically-created data (admin-approved AI products, real orders)
  // that isn't part of this static list. Pruning "unknown" rows was only
  // ever meant for the one-time Phase 1 category migration and is actively
  // destructive now — it can violate FK constraints against real orders (as
  // it did) and would silently delete legitimate admin-approved products.

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: "ADMIN" },
      create: {
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
