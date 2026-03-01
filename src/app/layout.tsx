import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripgenie — AI-Powered Travel Platform",
  description:
    "Plan trips, book flights and hotels, and document your journeys with AI-powered assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
