import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { findProductImages } from "../src/lib/product-image";

const prisma = new PrismaClient();

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Lifestyle", slug: "home-lifestyle" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Books & Stationery", slug: "books-stationery" },
  { name: "Toys & Kids", slug: "toys-kids" },
];

// Electronics prices/images below are verified against real, currently-sold
// listings on startech.com.bd (a major BD electronics retailer whose
// robots.txt allows this — Allow: / with only narrow disallows on
// parameterized/search URLs — and whose terms carry no anti-scraping
// clause, unlike Daraz's explicit ban). Where the exact named model isn't
// carried there, the closest real equivalent was used instead and the
// product name updated to match — noted per item below. `compareAtPrice`
// is a modest illustrative markup for the on-sale/deals demo pages, not a
// verified "was" price; `price` and `imageUrl` are the real, current ones.
const products = [
  // Electronics
  {
    name: "Redragon K552 KUMARA RAINBOW Mechanical Keyboard",
    slug: "redragon-k552-mechanical-keyboard",
    description: "Compact 87-key mechanical keyboard with blue switches and rainbow RGB backlighting.",
    price: 4200,
    compareAtPrice: 4800,
    stock: 25,
    brand: "Redragon",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/keyboard/redragon/k552-kumara-rainbow/k552-kumara-rainbow-01-500x500.jpg",
  },
  {
    // Substituted: no unbranded generic wired mechanical keyboard exists at
    // Star Tech — this is their cheapest real wired mechanical keyboard.
    name: "PC Power K98 RGB Mechanical Keyboard",
    slug: "budget-wired-mechanical-keyboard",
    description: "Entry-level wired mechanical keyboard with RGB backlighting, a great first upgrade.",
    price: 2200,
    stock: 40,
    brand: "PC Power",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/keyboard/pc-power/k98/k98-white-gray-01-500x500.webp",
  },
  {
    name: "Logitech G102 LIGHTSYNC Gaming Mouse",
    slug: "logitech-g102-gaming-mouse",
    description: "Lightweight gaming mouse with customizable RGB lighting and an 8000 DPI sensor.",
    price: 2050,
    compareAtPrice: 2350,
    stock: 30,
    brand: "Logitech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/mouse/logitech/g102-lightsync/g102-black--01-500x500.webp",
  },
  {
    // Substituted: closest real budget silent wireless mouse at Star Tech.
    name: "Fantech Go W191 Silent Wireless Mouse",
    slug: "wireless-silent-mouse",
    description: "Compact wireless mouse with silent clicks, budget friendly.",
    price: 550,
    stock: 50,
    brand: "Fantech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/mouse/fantech/go-w191/go-w191-02-500x500.webp",
  },
  {
    // Substituted: real 23.8" monitor (Star Tech doesn't carry an exact
    // 24" FreeSync model at this tier) — closest real equivalent.
    name: "Dell S2421HN 23.8-inch FHD Monitor",
    slug: "24-inch-full-hd-monitor",
    description: "23.8-inch IPS monitor with AMD FreeSync, ideal for work and casual gaming.",
    price: 18000,
    compareAtPrice: 20500,
    stock: 12,
    brand: "Dell",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/monitor/dell/s2421hn/s2421hn-1-500x500.jpg",
  },
  {
    // Substituted: real budget wired headset at Star Tech.
    name: "Logitech H151 Stereo Headset",
    slug: "usb-wired-headset",
    description: "Comfortable stereo headset with a noise-cancelling mic.",
    price: 1750,
    stock: 35,
    brand: "Logitech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/headphone/logitech/h151/h151-2-500x500.jpg",
  },
  {
    // Substituted: real compact Bluetooth speaker at Star Tech.
    name: "Xiaomi Sound Pocket Bluetooth Speaker",
    slug: "bluetooth-portable-speaker",
    description: "Compact speaker with long battery life and deep bass.",
    price: 2250,
    compareAtPrice: 2600,
    // Real, fixed deadline computed at seed time (not a fake per-visit
    // countdown) — drives the homepage's flash-sale countdown.
    saleEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    stock: 20,
    brand: "Xiaomi",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/speaker/xiaomi/sound-pocket/sound-pocket-500x500.webp",
  },
  {
    // Substituted: real large RGB mouse pad at Star Tech.
    name: "Xtrike Me MP-606 RGB Gaming Mouse Pad (800x300mm)",
    slug: "rgb-mouse-pad-large",
    description: "Extended desk mat with RGB edge lighting.",
    price: 1100,
    stock: 45,
    brand: "Xtrike Me",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/mouse-pad/xtrike-me/mp-606/mp-606-1-500x500.webp",
  },
  {
    // Substituted: real foldable aluminum laptop stand at Star Tech.
    name: "WiWU S500 Foldable Aluminum Laptop Stand",
    slug: "laptop-stand-aluminum",
    description: "Adjustable, foldable aluminum laptop stand for better posture and cooling.",
    price: 850,
    stock: 18,
    brand: "WiWU",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/laptop-stand/wiwu/s500/s500-01-500x500.webp",
  },

  // Electronics — real, well-known mice, keyboards, and accessories
  {
    name: "Logitech M170 Wireless Mouse",
    slug: "logitech-m170-wireless-mouse",
    description: "Reliable 2.4GHz wireless mouse with a 12-month battery life and plug-and-play USB receiver.",
    price: 990,
    stock: 55,
    brand: "Logitech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/Accessories/Logitech/Mouse/m170-500x500.png",
  },
  {
    name: "Logitech M331 Silent Plus Wireless Mouse",
    slug: "logitech-m331-silent-plus-wireless-mouse",
    description: "90% quieter clicks than a standard mouse, with a comfortable contoured shape for all-day use.",
    price: 1900,
    compareAtPrice: 2200,
    stock: 30,
    brand: "Logitech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/mouse/logitech/m331-silent-plus/m331-3-500x500.png",
  },
  {
    name: "A4TECH OP-720 Wired Optical Mouse",
    slug: "a4tech-op-720-wired-optical-mouse",
    description: "Budget-friendly wired mouse with a smooth optical sensor and ergonomic design.",
    price: 425,
    stock: 70,
    brand: "A4Tech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/mouse/a4tech/op-720/op-720-01-500x500.jpg",
  },
  {
    name: "Razer DeathAdder Essential Gaming Mouse",
    slug: "razer-deathadder-essential-gaming-mouse",
    description: "Ergonomic esports gaming mouse with a 6400 DPI optical sensor and durable mechanical switches.",
    price: 2400,
    compareAtPrice: 2750,
    stock: 15,
    brand: "Razer",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/mouse/razer/deathadder-essetial/deathadder-essential-500x500.jpg",
  },
  {
    // Substituted: HP M100 isn't carried at Star Tech — closest real HP
    // wired mouse there instead.
    name: "HP X500 Wired Mouse",
    slug: "hp-m100-wired-mouse",
    description: "Simple, reliable USB wired mouse for everyday office and home use.",
    price: 400,
    stock: 60,
    brand: "HP",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/Accessories/Mouse/HP%20Mouse/HP%20X500%20Wired%20Mouse-500x500.jpg",
  },
  {
    name: "Logitech K380 Multi-Device Bluetooth Keyboard",
    slug: "logitech-k380-multi-device-bluetooth-keyboard",
    description: "Compact Bluetooth keyboard that pairs with up to three devices and switches between them instantly.",
    price: 3200,
    stock: 20,
    brand: "Logitech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/keyboard/logitech/k380/k380-black-500x500.webp",
  },
  {
    name: "A4TECH FK10 Fstyler Wired Keyboard",
    slug: "a4tech-fstyler-fk10-wired-keyboard",
    description: "Spill-resistant wired keyboard with a low-profile, quiet-typing design.",
    price: 1100,
    stock: 45,
    brand: "A4Tech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/keyboard/a4-tech/fk10-fstyler/fk10-02-500x500.webp",
  },
  {
    name: "Dell Wired Keyboard KB216",
    slug: "dell-kb216-wired-keyboard",
    description: "Full-size quiet-key wired keyboard built for everyday office reliability.",
    price: 1050,
    stock: 35,
    brand: "Dell",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/Accessories/Dell/Dell%20Wired%20Keyboard%20KB216-Black-500x500.jpg",
  },
  {
    name: "Ajazz AK33 Hot Swappable Mechanical Keyboard",
    slug: "ajazz-ak33-rgb-mechanical-keyboard",
    description: "82-key hot-swappable mechanical keyboard with red switches and per-key LED backlighting.",
    price: 4000,
    compareAtPrice: 4600,
    stock: 12,
    brand: "Ajazz",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/keyboard/ajazz/ak33/ak33-01-500x500.webp",
  },
  {
    name: "Xiaomi Redmi Buds 4 Active",
    slug: "xiaomi-redmi-buds-4-active",
    description: "True wireless earbuds with 20-hour total battery life and low-latency gaming mode.",
    price: 1999,
    compareAtPrice: 2300,
    stock: 30,
    brand: "Xiaomi",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/earbuds/xiaomi/redmi-buds-4-active/redmi-buds-4-active-01-500x500.webp",
  },
  {
    // Substituted: the plain "PowerCore 10000" is discontinued — the
    // current real Anker 10000mAh power bank at Star Tech instead.
    name: "Anker 323 PowerCore PIQ 10000mAh Power Bank",
    slug: "anker-powercore-10000-power-bank",
    description: "Compact 10000mAh power bank with fast-charging support, small enough for a pocket.",
    price: 2990,
    stock: 25,
    brand: "Anker",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/power-bank/anker/323-powercore-piq/323-powercore-piq-01-500x500.webp",
  },
  {
    name: "TP-Link Archer C6 AC1200 Gigabit Router",
    slug: "tp-link-archer-c6-ac1200-wifi-router",
    description: "Dual-band gigabit router with four external antennas for strong whole-home coverage.",
    price: 3440,
    stock: 18,
    brand: "TP-Link",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/router/tp-link/archer-c6-ac1200/archer-c6-01-500x500.webp",
  },
  {
    // Star Tech lists this generation under the "Mi Band" branding.
    name: "Xiaomi Mi Band 8 Smart Bracelet",
    slug: "xiaomi-smart-band-8",
    description: "Slim fitness tracker with heart-rate monitoring, sleep tracking, and a 1.62-inch AMOLED display.",
    price: 4590,
    compareAtPrice: 5250,
    stock: 20,
    brand: "Xiaomi",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/smart-band/xiaomi/mi-band-8/mi-band-8-500x500.webp",
  },
  {
    name: "JBL Go 3 Portable Bluetooth Speaker",
    slug: "jbl-go-3-portable-bluetooth-speaker",
    description: "Pocket-sized, splashproof Bluetooth speaker with punchy JBL Pro Sound.",
    price: 4099,
    stock: 22,
    brand: "JBL",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/speaker/jbl/go-3/go-3-black-orange-500x500.webp",
  },
  {
    name: "Logitech Webcam C270 HD",
    slug: "logitech-c270-hd-webcam",
    description: "720p HD webcam with a built-in noise-reducing mic, ideal for calls and streaming.",
    price: 2300,
    stock: 16,
    brand: "Logitech",
    categorySlug: "electronics",
    imageUrl: "https://www.startech.com.bd/image/cache/catalog/webcam/logitech/c270/c270-01-500x500.webp",
  },

  // Fashion
  {
    name: "Men's Casual Cotton T-Shirt",
    slug: "mens-casual-cotton-tshirt",
    description: "Soft, breathable 100% cotton t-shirt for everyday wear.",
    price: 550,
    stock: 60,
    brand: "UrbanThread",
    categorySlug: "fashion",
  },
  {
    name: "Women's Denim Jacket",
    slug: "womens-denim-jacket",
    description: "Classic fit denim jacket, a wardrobe staple for every season.",
    price: 2200,
    compareAtPrice: 2800,
    stock: 25,
    brand: "UrbanThread",
    categorySlug: "fashion",
  },
  {
    name: "Unisex Canvas Sneakers",
    slug: "unisex-canvas-sneakers",
    description: "Lightweight canvas sneakers that go with almost any outfit.",
    price: 1800,
    compareAtPrice: 2200,
    stock: 32,
    brand: "UrbanThread",
    categorySlug: "fashion",
  },

  // Home & Lifestyle
  {
    name: "Ceramic Coffee Mug Set (4-Piece)",
    slug: "ceramic-coffee-mug-set",
    description: "Set of 4 matte-finish ceramic mugs, microwave and dishwasher safe.",
    price: 450,
    stock: 40,
    brand: "HomeCraft",
    categorySlug: "home-lifestyle",
  },
  {
    name: "Scented Candle Gift Set",
    slug: "scented-candle-gift-set",
    description: "3-candle gift set in lavender, vanilla, and sandalwood scents.",
    price: 650,
    stock: 28,
    brand: "HomeCraft",
    categorySlug: "home-lifestyle",
  },
  {
    name: "Cotton Bedsheet Set (Queen)",
    slug: "cotton-bedsheet-set-queen",
    description: "Queen-size cotton bedsheet with two pillow covers, machine washable.",
    price: 1800,
    compareAtPrice: 2200,
    stock: 22,
    brand: "HomeCraft",
    categorySlug: "home-lifestyle",
  },

  // Beauty & Personal Care
  {
    name: "Herbal Face Wash (100ml)",
    slug: "herbal-face-wash-100ml",
    description: "Gentle daily face wash with neem and aloe vera extracts.",
    price: 320,
    stock: 55,
    brand: "PureGlow",
    categorySlug: "beauty-personal-care",
  },
  {
    name: "Electric Hair Trimmer",
    slug: "electric-hair-trimmer",
    description: "Cordless rechargeable trimmer with multiple length guides.",
    price: 1250,
    compareAtPrice: 1600,
    stock: 20,
    brand: "PureGlow",
    categorySlug: "beauty-personal-care",
  },
  {
    name: "Moisturizing Body Lotion (200ml)",
    slug: "moisturizing-body-lotion-200ml",
    description: "Non-greasy daily body lotion for soft, hydrated skin.",
    price: 380,
    stock: 48,
    brand: "PureGlow",
    categorySlug: "beauty-personal-care",
  },

  // Sports & Outdoors
  {
    name: "Non-Slip Yoga Mat",
    slug: "non-slip-yoga-mat",
    description: "6mm thick yoga mat with carry strap, non-slip on both sides.",
    price: 900,
    compareAtPrice: 1100,
    stock: 30,
    brand: "ActiveGear",
    categorySlug: "sports-outdoors",
  },
  {
    name: "Adjustable Dumbbell Set (5kg Pair)",
    slug: "adjustable-dumbbell-set-5kg",
    description: "Pair of 5kg adjustable dumbbells for home strength training.",
    price: 2500,
    compareAtPrice: 3200,
    stock: 15,
    brand: "ActiveGear",
    categorySlug: "sports-outdoors",
  },
  {
    name: "Sports Water Bottle (1L)",
    slug: "sports-water-bottle-1l",
    description: "Leak-proof 1-litre bottle with time markers, BPA-free.",
    price: 350,
    stock: 50,
    brand: "ActiveGear",
    categorySlug: "sports-outdoors",
  },

  // Books & Stationery
  {
    name: "Bestselling Novel Box Set",
    slug: "bestselling-novel-box-set",
    description: "3-book box set of award-winning contemporary fiction.",
    price: 950,
    compareAtPrice: 1200,
    stock: 18,
    brand: "PagePress",
    categorySlug: "books-stationery",
  },
  {
    name: "A5 Notebook Pack (3-Pack)",
    slug: "a5-notebook-pack-3pack",
    description: "Set of 3 ruled A5 notebooks, 120 pages each.",
    price: 280,
    stock: 60,
    brand: "PagePress",
    categorySlug: "books-stationery",
  },
  {
    name: "Premium Gel Pen Set (10-Pack)",
    slug: "premium-gel-pen-set-10pack",
    description: "Smooth-writing gel pens in assorted colors, 10 per pack.",
    price: 220,
    stock: 70,
    brand: "PagePress",
    categorySlug: "books-stationery",
  },

  // Books & Stationery — real, well-known titles with real cover art from
  // the Open Library Covers API (a free public API built for exactly this,
  // not scraped from any retailer). `imageUrl` set explicitly here skips
  // the generic Openverse stock-photo search down in main() — that search
  // has no way to find an exact book cover for a named title.
  {
    name: "Himu Rimande — Humayun Ahmed",
    slug: "himu-rimande-humayun-ahmed",
    description: "A novel from Humayun Ahmed's beloved Himu series.",
    price: 250,
    stock: 20,
    brand: "Anyaprokash",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/11980293-L.jpg",
  },
  {
    name: "Devdas — Sarat Chandra Chattopadhyay",
    slug: "devdas-sarat-chandra-chattopadhyay",
    description: "The classic Bengali tragic romance novel by Sarat Chandra Chattopadhyay.",
    price: 280,
    stock: 18,
    brand: "Penguin",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/111015-L.jpg",
  },
  {
    name: "Gitanjali — Rabindranath Tagore",
    slug: "gitanjali-rabindranath-tagore",
    description: "The Nobel Prize-winning collection of devotional poetry by Rabindranath Tagore.",
    price: 350,
    stock: 25,
    brand: "Kakoli Prokashoni",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/8246100-L.jpg",
  },
  {
    name: "Atomic Habits — James Clear",
    slug: "atomic-habits-james-clear",
    description: "A practical, bestselling guide to building good habits and breaking bad ones.",
    price: 650,
    compareAtPrice: 780,
    stock: 30,
    brand: "Penguin",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/12539702-L.jpg",
  },
  {
    name: "The Alchemist — Paulo Coelho",
    slug: "the-alchemist-paulo-coelho",
    description: "Paulo Coelho's classic novel about a shepherd's journey to find his personal legend.",
    price: 450,
    stock: 35,
    brand: "HarperCollins",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/7414780-L.jpg",
  },
  {
    name: "Pather Panchali — Bibhutibhushan Bandyopadhyay",
    slug: "pather-panchali-bibhutibhushan-bandyopadhyay",
    description: "The classic Bengali coming-of-age novel by Bibhutibhushan Bandyopadhyay.",
    price: 300,
    stock: 22,
    brand: "Kakoli Prokashoni",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/6975329-L.jpg",
  },
  {
    name: "How to Win Friends and Influence People — Dale Carnegie",
    slug: "how-to-win-friends-and-influence-people-dale-carnegie",
    description: "The timeless bestseller on communication, persuasion, and building relationships.",
    price: 420,
    stock: 28,
    brand: "Vermilion",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/6549931-L.jpg",
  },
  {
    name: "Harry Potter and the Philosopher's Stone — J.K. Rowling",
    slug: "harry-potter-and-the-philosophers-stone-jk-rowling",
    description: "The first book in J.K. Rowling's Harry Potter series.",
    price: 550,
    compareAtPrice: 650,
    stock: 24,
    brand: "Bloomsbury",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/15155833-L.jpg",
  },
  {
    name: "Padma Nadir Majhi — Manik Bandopadhyay",
    slug: "padma-nadir-majhi-manik-bandopadhyay",
    description: "A classic Bengali novel about fishermen's lives on the Padma river, by Manik Bandopadhyay.",
    price: 260,
    stock: 20,
    brand: "Kakoli Prokashoni",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/9183016-L.jpg",
  },
  {
    name: "Rich Dad Poor Dad — Robert Kiyosaki",
    slug: "rich-dad-poor-dad-robert-kiyosaki",
    description: "Robert Kiyosaki's personal-finance classic on money, assets, and financial independence.",
    price: 480,
    stock: 26,
    brand: "Plata Publishing",
    categorySlug: "books-stationery",
    imageUrl: "https://covers.openlibrary.org/b/id/8315603-L.jpg",
  },

  // Toys & Kids
  {
    name: "LEGO Classic Creative Bricks Box",
    slug: "lego-classic-creative-bricks-box",
    description: "484-piece box of classic LEGO bricks in assorted colors and shapes for open-ended building.",
    price: 3200,
    compareAtPrice: 3800,
    stock: 20,
    brand: "LEGO",
    categorySlug: "toys-kids",
  },
  {
    name: "Hot Wheels 5-Car Gift Pack",
    slug: "hot-wheels-5-car-gift-pack",
    description: "Pack of 5 die-cast Hot Wheels cars in collectible packaging.",
    price: 950,
    stock: 35,
    brand: "Hot Wheels",
    categorySlug: "toys-kids",
  },
  {
    name: "Rubik's Cube 3x3 Speed Cube",
    slug: "rubiks-cube-3x3-speed-cube",
    description: "Smooth-turning 3x3 speed cube for puzzle solving and competitive cubing.",
    price: 450,
    stock: 50,
    brand: "Rubik's",
    categorySlug: "toys-kids",
  },
  {
    name: "Barbie Fashionista Doll",
    slug: "barbie-fashionista-doll",
    description: "Barbie doll with on-trend outfit and accessories from the Fashionista line.",
    price: 1800,
    compareAtPrice: 2100,
    stock: 18,
    brand: "Barbie",
    categorySlug: "toys-kids",
  },
  {
    name: "Nerf Elite 2.0 Blaster",
    slug: "nerf-elite-2-0-blaster",
    description: "Pump-action foam dart blaster with 12-dart clip, part of the Nerf Elite 2.0 line.",
    price: 1600,
    stock: 22,
    brand: "Nerf",
    categorySlug: "toys-kids",
  },
  {
    name: "Wooden Building Blocks Set (Educational)",
    slug: "wooden-building-blocks-set-educational",
    description: "100-piece natural wooden block set for early learning and motor-skill development.",
    price: 850,
    stock: 30,
    brand: "Generic",
    categorySlug: "toys-kids",
  },
  {
    name: "Remote Control Off-Road Car",
    slug: "remote-control-off-road-car",
    description: "4WD remote control car with rugged tires, built for rough indoor and outdoor terrain.",
    price: 1950,
    compareAtPrice: 2400,
    stock: 15,
    brand: "Generic",
    categorySlug: "toys-kids",
  },
  {
    name: "Play-Doh Fun Factory Set",
    slug: "play-doh-fun-factory-set",
    description: "Modeling compound set with shaping tools for creative play.",
    price: 1100,
    stock: 25,
    brand: "Play-Doh",
    categorySlug: "toys-kids",
  },
  {
    name: "1000-Piece Scenic Jigsaw Puzzle",
    slug: "1000-piece-scenic-jigsaw-puzzle",
    description: "1000-piece jigsaw puzzle featuring a scenic landscape, for ages 10 and up.",
    price: 650,
    stock: 28,
    brand: "Generic",
    categorySlug: "toys-kids",
  },
  {
    name: "UNO Card Game",
    slug: "uno-card-game",
    description: "The classic family card game of matching colors and numbers.",
    price: 350,
    stock: 45,
    brand: "Mattel",
    categorySlug: "toys-kids",
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

  for (const { categorySlug, imageUrl: explicitImageUrl, ...product } of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });
    // A handful of products (currently: books) set imageUrl explicitly to a
    // real, verified photo (e.g. an Open Library book cover) — the generic
    // Openverse keyword search has no way to find an exact cover/photo for
    // a named title, so it's skipped entirely for those.
    const images = explicitImageUrl ? [explicitImageUrl] : await findProductImages(product.name, product.slug, 4);
    const imageUrl = explicitImageUrl ?? images[0];

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, imageUrl, images, categoryId: category.id },
      create: { ...product, imageUrl, images, categoryId: category.id },
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
