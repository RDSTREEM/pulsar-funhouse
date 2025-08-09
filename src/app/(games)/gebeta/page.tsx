"use client";
import dynamic from "next/dynamic";

const RockPaperScissors = dynamic(() => import("./Gebeta"), {
  ssr: false,
});

export default function GebetaPage() {
  return (
    <div className="glass-main">
      <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
        <RockPaperScissors />
      </div>
    </div>
  );
}
