import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omega Savings Projection Calculator",
  description:
    "Explore an illustrative savings projection with Omega Financial Management.",
  applicationName: "Omega Savings Projection Calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IE">
      <body>{children}</body>
    </html>
  );
}
