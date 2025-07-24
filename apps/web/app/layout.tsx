"use client";
import "../styles/globals.css";
import { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { Analytics } from "@vercel/analytics/react";
import { tiktokAnalytics } from "../lib/analytics";
import ToastContainer from "../components/ToastContainer";

export default function RootLayout({ children }: { children: ReactNode }) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    tiktokAnalytics.init();
  }, [initAuth]);

  return (
    <html lang="en-US" className="bg-dark text-white">
      <head>
        <title>More Minutes</title>
        <meta name="description" content="Count less, live more." />
      </head>
      <body className="font-sans max-w-screen-md mx-auto px-4">
        {children}
        <ToastContainer />
        <Analytics />
      </body>
    </html>
  );
} 