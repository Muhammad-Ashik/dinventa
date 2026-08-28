import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AiSearchChat } from "@/components/ai-search-chat";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
          <AiSearchChat />
        </CartProvider>
      </body>
    </html>
  );
}
