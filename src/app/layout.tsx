import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { PageTransition } from "@/components/page-transition";
import { AiSearchBubble } from "@/components/ai-search-bubble";

// Matches the reference's typography exactly (--font-body: "DM Sans" in its
// global.css) instead of the default Geist that next's starter ships with.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dinventa",
  description: "AI-driven ecommerce, built one feature at a time.",
};

// Standard next.js dark-mode-without-flash pattern: this runs synchronously
// before React hydrates, so the `.dark` class is already correct on
// <html> by the time paint happens (and, critically, before hydration —
// avoiding a server/client class mismatch warning since the server always
// renders without `.dark`).
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

// The full-bleed hero/products bands use \`width: calc(100vw - var(--scrollbar-width))\`
// instead of plain \`w-screen\` — 100vw is the browser window's full width,
// which on most desktop browsers includes room for the vertical scrollbar,
// while the page's actual visible/scrollable content area (clientWidth)
// does not. That few-pixel mismatch pushed those bands past the real right
// edge, creating a visible gap/overhang. Measuring the real scrollbar width
// in JS (rather than a CSS-only vw trick) keeps this correct regardless of
// how deeply the band is nested, since the resulting value is a plain
// pixel number, not a percentage needing to be re-resolved per-element.
const scrollbarWidthScript = `
(function () {
  function setScrollbarWidth() {
    var width = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', width + 'px');
  }
  setScrollbarWidth();
  window.addEventListener('load', setScrollbarWidth);
  window.addEventListener('resize', setScrollbarWidth);
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: scrollbarWidthScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <ScrollToTopButton />
          <AiSearchBubble />
        </CartProvider>
      </body>
    </html>
  );
}
