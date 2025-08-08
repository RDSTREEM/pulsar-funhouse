"use client";
import dynamic from "next/dynamic";

const RockPaperScissors = dynamic(() => import("./Gebeta"), {
  ssr: false,
});

export default function RockPaperScissorsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <RockPaperScissors />
    </main>
  );
}
