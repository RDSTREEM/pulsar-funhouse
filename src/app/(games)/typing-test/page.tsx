"use client";

import dynamic from "next/dynamic";

const TypingTest = dynamic(() => import("./typing-test"), { ssr: false });

export default function TypingTestPage() {
  return (
    <div className="glass-main">
      <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
        <TypingTest />
      </div>
    </div>
  );
}
