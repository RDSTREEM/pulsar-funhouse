import React, { useState, useEffect } from "react";
import { getOrCreateDaily } from "@/lib/utils/dailySupabase";

const GEMINI_API = `${process.env.NEXT_PUBLIC_GEMINI_API_URL}=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

async function fetchGeminiContent() {
  const prompt = `Respond ONLY with a valid JSON object (no markdown, no code block, no explanation). The object should have three fields: fact, quote, and riddle. The riddle should be an object with question and answer fields. Example: {"fact": "...", "quote": "...", "riddle": {"question": "...", "answer": "..."}}. Make them fun and unique for today.`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  if (!GEMINI_API) {
    throw new Error("GEMINI_API environment variable is not defined.");
  }
  const res = await fetch(GEMINI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  console.log('Gemini raw response:', data);
  try {
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }
    const json = JSON.parse(text);
    return json;
  } catch {
    return {
      fact: "Could not fetch fact.",
      quote: "Could not fetch quote.",
      riddle: { question: "Could not fetch riddle.", answer: "" }
    };
  }
}

interface DailySectionProps {
  streak: number;
  onPuzzleSolved: () => void;
}

export default function DailySection({ streak, onPuzzleSolved }: DailySectionProps) {
  const [fact, setFact] = useState("");
  const [quote, setQuote] = useState("");
  const [puzzle, setPuzzle] = useState({ type: "riddle", question: "", answer: "" });
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    getOrCreateDaily(today, fetchGeminiContent)
      .then((daily) => {
        setFact(daily.fact);
        setQuote(daily.quote);
        setPuzzle({ type: "riddle", question: daily.riddle_question, answer: daily.riddle_answer });
      })
      .finally(() => setLoading(false));
  }, []);

  function checkAnswer() {
    if (userAnswer.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      setSolved(true);
      onPuzzleSolved();
    }
  }

  return (
    <section className="glass-section mb-8 w-full flex flex-col items-center max-w-2xl mx-auto p-6">
      <h2 className="gradient-title text-2xl mb-4">Daily</h2>
      <div className="mb-2 text-gray-300">Fact: {loading ? <span className="italic text-gray-500">Loading...</span> : fact}</div>
      <div className="mb-2 text-gray-300">Quote: {loading ? <span className="italic text-gray-500">Loading...</span> : quote}</div>
      <div className="mb-2 text-gray-300">Puzzle: {loading ? <span className="italic text-gray-500">Loading...</span> : puzzle.question}</div>
      {!solved && !loading ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            className="glass-input"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={!puzzle.question}
          />
          <button
            className="gradient-btn px-3 py-1"
            onClick={checkAnswer}
            disabled={!puzzle.question}
          >
            Submit
          </button>
        </div>
      ) : solved ? (
        <div className="text-green-400 mt-2">Correct! Streak: {streak}</div>
      ) : null}
    </section>
  );
}
