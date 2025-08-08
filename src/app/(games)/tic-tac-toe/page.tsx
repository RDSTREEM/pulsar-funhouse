"use client";
import dynamic from "next/dynamic";

const TicTacToe = dynamic(() => import("./TicTacToe"), { ssr: false });

export default function TicTacToePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <TicTacToe />
    </main>
  );
}
