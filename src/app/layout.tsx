import "./globals.css";
import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";

export const metadata = {
  title: "Funhouse",
  description: "Mini game collection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Get streak from localStorage for Navbar
  const [streak, setStreak] = useState<number>(0);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("daily-streak") : null;
    setStreak(saved ? parseInt(saved) : 0);
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-950">
        <Navbar streak={streak} />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
