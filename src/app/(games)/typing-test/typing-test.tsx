"use client";

import React, { useState, useEffect, useRef } from "react";
import "@/../public/assets/typing-test/style.css";
import { calculateAccuracy, calculateWPM } from "@/lib/typingHelpers";

const sampleText = "The quick brown fox jumps over the lazy dog.";

export default function TypingTest() {
  const [input, setInput] =useState("");
  const [startTime, setStartTime] =useState<number | null>(null);
  const [endTime, setEndTime] =useState<number | null>(null);
  const [finished, setFinished] =useState(false);
  const inputRef =useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.length ===1 && !startTime) {
      setStartTime(Date.now());
    }
    if (input === sampleText) {
      setEndTime(Date .now());
      setFinished(true);
    }
  }, [input, startTime]);

  const handleChange =(e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return   ; 
    setInput(e.target.value  );
  };

  const resetTest = () => {
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setFinished(false);
    inputRef.current?.focus();
  };

  const timeInSeconds =
    startTime && endTime ? (endTime - startTime) / 1000 : 0;

  const accuracy = calculateAccuracy(input, sampleText);
  const wpm = calculateWPM(input, timeInSeconds);

  return (
    <div className="w-full text-center">
      <h1 className="gradient-title text-4xl mb-6">Typing Test</h1>
      <p className="text-lg text-gray-300 mb-4">{sampleText}</p>
      <input
        ref={inputRef}
        type="text"
        className="glass-input w-full max-w-lg mx-auto mb-4"
        value={input}
        onChange={handleChange}
        disabled={finished}
        placeholder="Start typing here..."
        spellCheck={false}
      />
      {finished && (
        <div className="glass-section mt-6 p-4">
          <p className="text-gray-200">Time: {timeInSeconds.toFixed(2)} seconds</p>
          <p className="text-gray-200">Accuracy: {accuracy.toFixed(2)}%</p>
          <p className="text-gray-200">Words per minute: <span className="font-bold text-pink-400">{wpm.toFixed(2)}</span></p>
          <button onClick={resetTest} className="gradient-btn mt-4 px-6 py-2">Restart Test</button>
        </div>
      )}
    </div>
  );
}
