import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
    template: "%s | Shadii.pk",
  },
  description:
    "Find your perfect life partner on Shadii.pk — Pakistan's most trusted, modern matrimonial platform with verified profiles, smart AI matching, and complete privacy.",
  keywords: [
    "matrimonial Pakistan",
    "Pakistani matrimonial website",
    "rishta app Pakistan",
    "shadi app Pakistan",
    "marriage bureau Pakistan",
    "marriage bureau Lahore",
    "marriage bureau Karachi",
    "marriage bureau Islamabad",
    "free Pakistani rishta website",
    "online shadi website",
    "serious matrimonial platform",
    "CNIC verified rishta",
    "overseas Pakistani rishta",
    "Shaadi",
    "Nikah",
    "Rishta",
    "shadii.pk"
  ],
  authors: [{ name: "Shadii.pk" }],
  creator: "Shadii.pk",
  metadataBase: new URL("https://www.shadii.pk"),
  openGraph: {
    title: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
    description:
      "Find your perfect life partner with verified profiles, AI-powered matches, and complete privacy.",
    url: "https://www.shadii.pk",
    siteName: "Shadii.pk",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://www.shadii.pk/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
    description: "Verified profiles. Smart matching. Private and safe.",
    images: ["https://www.shadii.pk/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--canvas)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
