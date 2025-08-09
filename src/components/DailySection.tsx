import React, { useState, useEffect } from "react";

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
  const [userAnswer, setUserAnswer] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    fetchGeminiContent().then((json) => {
      setFact(json.fact);
      setQuote(json.quote);
      setPuzzle({ type: "riddle", ...json.riddle });
    });
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
      <div className="mb-2 text-gray-300">Fact: {fact || <span className="italic text-gray-500">Loading...</span>}</div>
      <div className="mb-2 text-gray-300">Quote: {quote || <span className="italic text-gray-500">Loading...</span>}</div>
      <div className="mb-2 text-gray-300">Puzzle: {puzzle.question || <span className="italic text-gray-500">Loading...</span>}</div>
      {!solved ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            className="px-2 py-1 rounded bg-gray-900 text-white"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={!puzzle.question}
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={checkAnswer}
            disabled={!puzzle.question}
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
