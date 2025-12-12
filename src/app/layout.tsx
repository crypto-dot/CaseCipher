import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeScript } from "@/components/theme/theme-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CaseCypher — Modern case management",
  description:
    "CaseCypher is a case management SaaS for tracking ownership, status, and work-in-progress across your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeScript />
        <Providers>
          <div className="min-h-dvh bg-background text-foreground">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
