import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["opsz"], display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["300", "400"], display: "swap" });

export const metadata: Metadata = {
  title: "Astronomia Luxe — Time, laid bare.",
  description: "A haute horlogerie skeleton wristwatch in rose gold. 407 components, assembled by one watchmaker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
