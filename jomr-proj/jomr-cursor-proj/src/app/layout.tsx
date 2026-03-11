import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

// System fonts (no Google Fonts fetch during Docker build)

export const metadata: Metadata = {
  title: "GitHub Analyzer - Insights for Open Source Repositories",
  description:
    "Get powerful insights, summaries, stars analysis, cool facts, latest PRs and version updates for any open source GitHub repository.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
