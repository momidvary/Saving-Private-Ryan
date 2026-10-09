import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/lalezar/400.css";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "نجات سرباز رایان",
  description: "همراه روزبه‌روز مامان و بابای رایان، از بارداری تا بزرگ شدن",
  applicationName: "نجات سرباز رایان",
  appleWebApp: { capable: true, title: "رایان", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d3e8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#121b3f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
