"use client";

import dynamic from "next/dynamic";

const TypingTest = dynamic(() => import("./typing-test"), { ssr: false });

export default function TypingTestPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <TypingTest />
    </main>
  );
}
