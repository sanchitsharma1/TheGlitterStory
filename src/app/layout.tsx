import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thejewelnest.co.in"),
  title: {
    default: "The Jewel Nest | Modern Jewellery",
    template: "%s | The Jewel Nest",
  },
  description:
    "Modern, quietly luxurious jewellery from The Jewel Nest - a house of The Glitter Story. Shop necklaces, earrings, bracelets and more. Ships across India.",
  openGraph: {
    title: "The Jewel Nest",
    description: "Modern jewellery, quietly luxurious.",
    url: "https://thejewelnest.co.in",
    siteName: "The Jewel Nest",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/brand/mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
