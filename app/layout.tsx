import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";

const sfProDisplay = localFont({
  src: [
    { path: "../public/fonts/SF-Pro-Display/SF-Pro-Display-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/SF-Pro-Display/SF-Pro-Display-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/SF-Pro-Display/SF-Pro-Display-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/SF-Pro-Display/SF-Pro-Display-Semibold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/SF-Pro-Display/SF-Pro-Display-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/SF-Pro-Display/SF-Pro-Display-Heavy.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-sf-pro-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "esim.vn - eSIM for Global Travel",
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
          "min-h-screen bg-white antialiased overflow-x-hidden",
          sfProDisplay.variable,
          sfProDisplay.className
        )}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
