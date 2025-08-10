"use client";

import React, { useState, useEffect, useRef } from "react";
import "@/../public/assets/typing-test/style.css";
import { calculateAccuracy, calculateWPM } from "@/lib/typingHelpers";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect in every skill you try.",
  "Typing fast requires focus and good technique.",
  "React is a popular library for building user interfaces.",
  "Consistency and patience are keys to success.",
];

export default function TypingTest() {
  const [sampleText, setSampleText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pick random text on mount
  useEffect(() => {
    setSampleText(randomSampleText());
  }, []);

  // Function to pick random sample text
  function randomSampleText() {
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  }

  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now());
    }
    if (input === sampleText && sampleText !== "") {
      setEndTime(Date.now());
      setFinished(true);
    }
  }, [input, startTime, sampleText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    if (e.target.value.length > sampleText.length) return;
    setInput(e.target.value);
  };

  const resetTest = () => {
    setSampleText(randomSampleText());
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setFinished(false);
    inputRef.current?.focus();
  };

  const timeInSeconds =
    startTime && endTime ? (endTime - startTime) / 1000 : startTime ? (Date.now() - startTime) / 1000 : 0;

  const accuracy = calculateAccuracy(input, sampleText);
  const wpm = calculateWPM(input, timeInSeconds);

  const renderText = () => {
    const textArr = sampleText.split("");
    return textArr.map((char, idx) => {
      let colorClass = "";
      if (idx < input.length) {
        colorClass = char === input[idx] ? "text-green-400" : "text-red-500";
      }
      return (
        <span key={idx} className={colorClass}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full text-center max-w-3xl mx-auto p-6">
      <h1 className="gradient-title text-4xl mb-6">Typing Test</h1>
      <p className="text-lg mb-4 select-none">{renderText()}</p>

      <input
        ref={inputRef}
        type="text"
        className="glass-input w-full max-w-lg mx-auto mb-4"
        value={input}
        onChange={handleChange}
        disabled={finished}
        placeholder="Start typing here..."
        spellCheck={false}
        autoComplete="off"
      />

      <div className="flex justify-center space-x-6 text-gray-200 mb-4">
        <p>Time: {timeInSeconds.toFixed(2)}s</p>
        <p>Accuracy: {accuracy.toFixed(2)}%</p>
        <p>
          WPM: <span className="font-bold text-pink-400">{wpm.toFixed(2)}</span>
        </p>
      </div>

      {finished && (
        <div className="glass-section mt-6 p-4 rounded-md bg-gray-800 bg-opacity-50">
          <p className="mb-2 text-green-400 font-semibold">Test Completed!</p>
          <p>Final Time: {timeInSeconds.toFixed(2)} seconds</p>
          <p>Final Accuracy: {accuracy.toFixed(2)}%</p>
          <p>
            Final Words per Minute:{" "}
            <span className="font-bold text-pink-400">{wpm.toFixed(2)}</span>
          </p>
          <button
            onClick={resetTest}
            className="gradient-btn mt-4 px-6 py-2 rounded"
          >
            Restart Test
          </button>
        </div>
      )}
    </div>
  );
}
