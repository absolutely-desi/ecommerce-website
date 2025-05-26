// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono, georgia, montserrat } from "@/lib/fonts";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Absolutely Desi",
  description: "Premium affiliate marketplace for authentic Indian ethnic wear",
  keywords: "Indian clothing, ethnic wear, saree, lehenga, kurta, affiliate marketing",
  icons: {
    icon: "/ad-logo-3.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${georgia.variable} ${montserrat.variable} antialiased bg-black text-white`}
      >
          <AuthProvider>
            {children}
          </AuthProvider>
      </body>
    </html>
  );
}