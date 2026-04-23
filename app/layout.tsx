import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/* const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
}); */
const inter = { variable: "font-sans" };

export const metadata: Metadata = {
  title: "RepCore — Gym Management",
  description: "Modern gym management for growing gyms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#0D0D14] text-[#F1F5F9] antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1C1C2E",
              border: "1px solid #1E1E30",
              color: "#F1F5F9",
            },
          }}
        />
      </body>
    </html>
  );
}
