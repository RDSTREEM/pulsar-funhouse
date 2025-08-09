"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const variants = [
  {
    name: "Classic Tic Tac Toe",
    component: dynamic(() => import("./TicTacToe"), { ssr: false })
  },
  {
    name: "Vsauce's Super Tic Tac Toe",
    component: dynamic(() => import("./SuperTicTacToe"), { ssr: false })
  },
  {
    name: "Oats Jenkins Tik Oat Toe",
    component: dynamic(() => import("./TikOatToe"), { ssr: false })
  },
  {
    name: "Misère Tic Tac Toe",
    component: dynamic(() => import("./MisereTicTacToe"), { ssr: false })
  },
  {
    name: "Wild Tic Tac Toe",
    component: dynamic(() => import("./WildTicTacToe"), { ssr: false })
  },
  {
    name: "Randomized Board Tic Tac Toe",
    component: dynamic(() => import("./RandomTicTacToe"), { ssr: false })
  }
];


export default function TicTacToePage() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = variants[selected].component;

  return (
    <div className="glass-main">
      <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
        <h2 className="text-2xl font-bold mb-4">Choose a Tic Tac Toe Variant</h2>
        <div className="mb-6 w-full flex flex-col gap-2">
          {variants.map((variant, idx) => (
            <button
              key={variant.name}
              className={`px-4 py-2 rounded ${selected === idx ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setSelected(idx)}
            >
              {variant.name}
            </button>
          ))}
        </div>
        <div className="w-full mt-4">
          <SelectedComponent />
        </div>
      </div>
    </div>
  );
}
