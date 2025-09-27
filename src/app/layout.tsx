import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Alignment Tracker",
  description:
    "Track how well you align with your Google Calendar schedule and earn points for productivity",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
