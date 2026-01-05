import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* =========================
   SEO + CANONICAL METADATA
   ========================= */
export const metadata: Metadata = {
  metadataBase: new URL("https://croossa.com"),

  title: {
    default: "Croossa Travels | Book Intercity Bus Tickets Online in India",
    template: "%s | Croossa Travels",
  },

  description:
    "Book intercity bus tickets online across India with Croossa Travels. Easy search, secure booking, and comfortable travel experience.",

  alternates: {
    canonical: "https://croossa.com/",
  },

  verification: {
    google: "qihoI8jehyTXSx3ucxsW1tjIliw0f_Mvnn9E26xRzJI",
  },

  openGraph: {
    title: "Croossa Travels – Intercity Bus Booking Platform",
    description:
      "Search and book intercity bus routes across India with Croossa Travels.",
    url: "https://croossa.com/",
    siteName: "Croossa Travels",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<div className="h-20 bg-transparent" />}>
          <Navbar />
        </Suspense>

        {children}

        <Footer />
      </body>
    </html>
  );
}
