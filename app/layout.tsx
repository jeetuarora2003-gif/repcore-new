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
      <body className="font-sans antialiased bg-[#09090B] text-[#FAFAFA]">
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: "#131316",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#FAFAFA",
              borderRadius: "12px",
            }
          }}
        />
      </body>
    </html>
  );
}
