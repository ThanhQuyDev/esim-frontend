import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Saily - eSIM for Global Travel",
  description:
    "Stay connected worldwide with affordable eSIM data plans. No physical SIM needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://kit.fontawesome.com/your-kit.css"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-bg-secondary font-sans antialiased overflow-x-hidden",
          inter.variable
        )}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
