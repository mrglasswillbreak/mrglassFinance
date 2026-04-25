import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppQueryProvider } from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mrGlassFinance",
  description: "Personal finance and budgeting SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground transition-colors">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            const themeKey = "mrGlassFinance-theme";
            const storedTheme = localStorage.getItem(themeKey);
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : (prefersDark ? "dark" : "light");
            document.documentElement.classList.toggle("dark", theme === "dark");
            document.documentElement.style.colorScheme = theme;
          })();`}
        </Script>
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
