import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Energy Insights Platform",
  description:
    "Ocean Professional dashboard for uploading meter data and documents, tracking analytics, benchmarking peers, and managing alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
