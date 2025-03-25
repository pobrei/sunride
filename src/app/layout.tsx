import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RideWeather Planner",
  description: "Plan your routes with detailed weather forecasts along the way",
  keywords: ["weather", "planning", "GPX", "route", "cycling", "hiking", "forecast"],
  authors: [{ name: "Filipp Shamshin" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
