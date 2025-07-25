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
  viewport: "width=device-width, initial-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "More Minutes"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 初始化错误处理和分析
              if (typeof window !== 'undefined') {
                import('/lib/error-handler').then(({ errorHandler }) => {
                  errorHandler.setupNetworkDetection();
                });
                
                import('/lib/analytics').then(({ initAnalytics }) => {
                  initAnalytics();
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
} 