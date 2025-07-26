import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import ClientProviders from "./client-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });

export const metadata: Metadata = {
  title: "More Minutes - Life Countdown & Legacy Vault",
  description: "Discover how much time you have left and create your digital legacy vault",
  manifest: "/manifest.json",
  themeColor: "#E50914",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "More Minutes"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: "no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="font-sans bg-dark text-white min-h-screen">
        <ClientProviders>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
              },
              success: {
                iconTheme: {
                  primary: '#00C48C',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#E50914',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ClientProviders>
        
        {/* 分析脚本 */}
      </body>
    </html>
  );
} 