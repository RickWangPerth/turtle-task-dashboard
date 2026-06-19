import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turtle Wishlist Tracker",
  description: "Internal task tracker for the Turtle Research Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
