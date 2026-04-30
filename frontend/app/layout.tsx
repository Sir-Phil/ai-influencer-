import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react"; // 1. Import ReactNode

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amaka AI | Political Mission Control",
  description: "AI-driven political advocacy for Nigeria",
};

// 2. Define the Interface for your props
interface RootLayoutProps {
  children: ReactNode;
}

// 3. Apply the type to the function parameters
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}