import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: "RepCore Premium",
  description: "Advanced Gym Management System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RepCore",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans antialiased bg-[#09090B] text-[#E4E4E7] relative min-h-screen">
        {/* Ambient background mesh */}
        <div className="fixed inset-0 pointer-events-none z-[-1] flex items-start justify-center overflow-hidden">
          <div className="w-[800px] h-[400px] bg-gradient-to-b from-[#10B981]/[0.03] to-transparent rounded-[100%] blur-3xl -translate-y-1/2" />
        </div>
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: "#18181B",
              border: "1px solid rgba(255,255,255,0.04)",
              color: "#E4E4E7",
              borderRadius: "12px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.4)"
            }
          }}
        />
      </body>
    </html>
  );
}
