import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InventoryProvider } from "@/context/InventoryContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { SearchModal } from "@/components/SearchModal";
import { ToastProvider } from "@/components/ui/Toast";
import { SettingsProvider } from "@/context/SettingsContext";
import { NotificationManager } from "@/components/NotificationManager";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Traxlio - Track Your Belongings",
  description: "Organize and track your inventory with rooms, boxes, and items",
  icons: {
    icon: "/traxlio-icon.svg",
    apple: "/traxlio-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SettingsProvider>
            <ToastProvider>
              <AuthProvider>
                <InventoryProvider>
                  <Header />
                  <SearchModal />
                  <NotificationManager />
                  <Toaster position="top-center" richColors />
                  {children}
                </InventoryProvider>
              </AuthProvider>
            </ToastProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
