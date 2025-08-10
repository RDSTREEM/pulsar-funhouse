"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const variants = [
  {
    name: "Classic Tic Tac Toe",
    component: dynamic(() => import("./TicTacToe"), { ssr: false }),
  },
  {
    name: "Vsauce's Super Tic Tac Toe",
    component: dynamic(() => import("./SuperTicTacToe"), { ssr: false }),
  },
];

export default function TicTacToePage() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = variants[selected].component;

  return (
    <div className="glass-main min-h-screen flex items-start justify-center p-4 sm:p-8">
      <div className="glass-card w-full max-w-full sm:max-w-xl mx-auto flex flex-col items-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Choose a Tic Tac Toe Variant
        </h2>
        <div className="mb-6 w-full flex flex-col gap-2">
          {variants.map((variant, idx) => (
            <button
              key={variant.name}
              className={`w-full px-3 py-2 rounded text-center text-sm sm:text-base ${
                selected === idx
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setSelected(idx)}
            >
              {variant.name}
            </button>
          ))}
        </div>
        <div className="w-full mt-2 sm:mt-4 max-h-[80vh] overflow-auto">
          <SelectedComponent />
        </div>
      </div>
    </div>
  );
}
