import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turtle Team Delivery Board",
  description: "Internal delivery board for the Turtle Research Team",
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
