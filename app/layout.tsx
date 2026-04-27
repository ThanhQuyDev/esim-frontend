import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "esim.vn - eSIM for Global Travel",
  description:
    "Stay connected worldwide with affordable eSIM data plans. No physical SIM needed.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;600;700&family=Google+Sans+Text:wght@400;500;600;700&display=swap"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-white antialiased overflow-x-hidden font-google-sans"
        )}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
