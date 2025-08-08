import React, { useState, useEffect } from "react";

const facts = [
  "Honey never spoils.",
  "Bananas are berries, but strawberries aren't.",
  "A group of flamingos is called a 'flamboyance'.",
];
const quotes = [
  "The best way to get started is to quit talking and begin doing. - Walt Disney",
  "Success is not in what you have, but who you are. - Bo Bennett",
  "The only limit to our realization of tomorrow is our doubts of today. - FDR",
];
const riddles = [
  {
    question: "What has keys but can't open locks?",
    answer: "A piano",
  },
  {
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "The letter M",
  },
];

function getDailyIndex() {
  // Use date to get a daily index
  const today = new Date();
  return today.getDate() % 3;
}

interface DailySectionProps {
  streak: number;
  onPuzzleSolved: () => void;
}

export default function DailySection({ streak, onPuzzleSolved }: DailySectionProps) {
  const [fact, setFact] = useState("");
  const [quote, setQuote] = useState("");
  const [puzzle, setPuzzle] = useState({ type: "riddle", question: "", answer: "" });
  const [userAnswer, setUserAnswer] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setFact(facts[getDailyIndex()]);
    setQuote(quotes[getDailyIndex()]);
    setPuzzle({ type: "riddle", ...riddles[getDailyIndex()] });
  }, []);

  function checkAnswer() {
    if (userAnswer.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      setSolved(true);
      onPuzzleSolved();
    }
  }

  return (
    <section className="bg-gray-800 rounded-lg p-6 mb-8 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Daily</h2>
      <div className="mb-2 text-gray-300">Fact: {fact}</div>
      <div className="mb-2 text-gray-300">Quote: {quote}</div>
      <div className="mb-2 text-gray-300">Puzzle: {puzzle.question}</div>
      {!solved ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            className="px-2 py-1 rounded bg-gray-900 text-white"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={checkAnswer}
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="text-green-400 mt-2">Correct! Streak: {streak}</div>
      )}
    </section>
  );
}
