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
  title: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
  description:
    "Find your perfect life partner on Shadii.pk — Pakistan's most trusted, modern matrimonial platform with verified profiles, smart AI matching, and complete privacy.",
  keywords: [
    "matrimonial",
    "pakistan",
    "rishta",
    "marriage",
    "shaadi",
    "nikah",
    "partner",
    "shadii.pk",
  ],
  authors: [{ name: "Shadii.pk" }],
  creator: "Shadii.pk",
  metadataBase: new URL("https://shadii.pk"),
  openGraph: {
    title: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
    description:
      "Find your perfect life partner with verified profiles, AI-powered matches, and complete privacy.",
    url: "https://shadii.pk",
    siteName: "Shadii.pk",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadii.pk — Pakistan's Premium Matrimonial Platform",
    description: "Verified profiles. Smart matching. Private and safe.",
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
