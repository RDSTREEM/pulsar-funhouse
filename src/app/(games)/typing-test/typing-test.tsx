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
    <div className="typing-test-container">
      <h1 className="title">Typing Test</h1>
      <p className="sample-text">{sampleText}</p>
      <input
        ref={inputRef}
        type="text"
        className="typing-input"
        value={input}
        onChange={handleChange}
        disabled={finished}
        placeholder="Start typing here..."
        spellCheck={false}
      />
      {finished && (
        <div className="results">
          <p>Time: {timeInSeconds.toFixed(2)} seconds</p>
          <p>Accuracy: { accuracy.toFixed(2)}%</p>
          <p>Words per minute: {wpm.toFixed(2)}</p>
          <button onClick={resetTest} className="reset-btn">
            Restart Test
          </button>
        </div>
      )}
    </div>
  );
}
