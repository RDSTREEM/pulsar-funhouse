"use client";

import { useState } from "react";

const choices = ["Rock", "Paper", "Scissors"] as const;
type Choice = typeof choices[number];

function getRandomChoice(): Choice {
  return choices[Math.floor(Math.random() * choices.length)];
}

function getResult(player: Choice, cpu: Choice): string {
  if (player === cpu) return "Draw!";
  if (
    (player === "Rock" && cpu === "Scissors") ||
    (player === "Paper" && cpu === "Rock") ||
    (player === "Scissors" && cpu === "Paper")
  )
    return "You win!";
  return "You lose!";
}

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [cpuChoice, setCpuChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function handleClick(choice: Choice) {
    const cpu = getRandomChoice();
    setPlayerChoice(choice);
    setCpuChoice(cpu);
    setResult(getResult(choice, cpu));
  }

  function reset() {
    setPlayerChoice(null);
    setCpuChoice(null);
    setResult(null);
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Rock Paper Scissors</h1>
      <div className="flex justify-center gap-4 mb-4">
        {choices.map((choice) => (
          <button
            key={choice}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={() => handleClick(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-4 text-lg">
          <p className="mb-2">You chose: {playerChoice}</p>
          <p className="mb-2">CPU chose: {cpuChoice}</p>
          <p className="font-semibold">{result}</p>
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
