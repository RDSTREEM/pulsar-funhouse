"use client";
import dynamic from "next/dynamic";

const TicTacToe = dynamic(() => import("./TicTacToe"), { ssr: false });

export default function TicTacToePage() {
  return (
    <div className="glass-main">
      <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
        <TicTacToe />
      </div>
    </div>
  );
}
