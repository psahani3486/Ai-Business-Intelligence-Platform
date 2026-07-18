import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus BI - Enterprise AI Analytics",
  description: "AI-powered Business Intelligence Platform",
};

import QueryProvider from "@/components/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="app-container">
            <Sidebar />
            <div className="main-content">
              <Header />
              {children}
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
