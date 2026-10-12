import type { Metadata } from "next";
import { Geist_Mono, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kiersnowski.com"),
  title: {
    default: "Alex Kiersnowski",
    template: "%s — Alex Kiersnowski",
  },
  description:
    "Senior Product Designer and Design Engineer. 10+ years bridging product design and production code for early-stage startups.",
  icons: {
    icon: [
      {
        url: "/icon-light.svg",
        type: "image/svg+xml",
        sizes: "any",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark.svg",
        type: "image/svg+xml",
        sizes: "any",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Alex Kiersnowski, Senior Product Designer and Design Engineer",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Keeps scroll-smooth for in-page anchors, but lets Next jump instantly to the top on page navigation.
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${interTight.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
