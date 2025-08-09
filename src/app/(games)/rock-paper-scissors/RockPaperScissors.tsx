"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ...existing code...


const GEMINI_API = `${process.env.NEXT_PUBLIC_GEMINI_API_URL}=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

async function judgeMove(prevMove: string, newMove: string) {
  const prompt = `You are an impartial judge in a creative battle game. The previous move was "${prevMove}". The user now claims "${newMove}" beats it. Respond ONLY with a valid JSON object (no markdown, no code block, no explanation). The object should have two fields: 'result' (true if the new move beats the previous, false otherwise) and 'reason' (a short, witty, or logical reason for your decision). Example: {"result": true, "reason": "A nuke obliterates scissors."}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  if (!GEMINI_API) throw new Error("GEMINI_API environment variable is not defined.");
  const res = await fetch(GEMINI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    return { result: false, reason: "AI glitched! Try again." };
  }
}



export default function RockPaperScissors() {
  const [moves, setMoves] = useState<string[]>([]);
  const [userMove, setUserMove] = useState("");
  const [judgement, setJudgement] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userMove.trim()) return;
    setInputDisabled(true);
    if (moves.length === 0) {
      setMoves([userMove]);
      setJudgement("");
      setReason("");
      setUserMove("");
      setInputDisabled(false);
      return;
    }
    const prevMove = moves[moves.length - 1];
    const ai = await judgeMove(prevMove, userMove);
    setJudgement(ai.result ? "Success!" : "Failed!");
    setReason(ai.reason);
    setMoves([...moves, userMove]);
    setUserMove("");
    if (!ai.result) setGameOver(true);
    setInputDisabled(false);
  }

  function resetGame() {
    setMoves([]);
    setJudgement("");
    setReason("");
    setGameOver(false);
    setUserMove("");
    setInputDisabled(false);
  }

  return (
    <motion.div
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-card w-full max-w-xl flex flex-col items-center relative p-4 sm:p-8 shadow-2xl rounded-2xl bg-opacity-80"
        initial={{ scale: 1, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        style={{ minHeight: '80vh', width: '100%', maxWidth: '480px' }}
      >
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
        >
        </motion.div>
        <motion.h1
          className="gradient-title text-2xl sm:text-3xl mb-2 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Rock Paper Scissors Ultimate
        </motion.h1>
        <motion.p
          className="mt-6 mb-8 text-base sm:text-lg text-gray-300 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Input anything. Next, try to input something that beats your previous move.<br />

        </motion.p>

        <AnimatePresence>
          {!gameOver && (
            <motion.form
              onSubmit={handleSubmit}
              className="mb-6 w-full flex flex-col sm:flex-row justify-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <motion.input
                type="text"
                value={userMove}
                onChange={e => setUserMove(e.target.value)}
                className="glass-input w-full sm:w-64 animate-none"
                placeholder={moves.length === 0 ? "Start with any move!" : `Your move to beat \"${moves[moves.length-1]}\"`}
                disabled={inputDisabled}
                whileFocus={{ scale: 1.03 }}
              />
              <motion.button
                type="submit"
                className="gradient-btn"
                disabled={inputDisabled}
                style={{ cursor: inputDisabled ? 'not-allowed' : 'pointer' }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {judgement && (
            <motion.div
              className="mb-4 flex flex-col items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.span
                className={judgement === "Success!" ? "text-green-400 font-extrabold text-2xl animate-[tada_1s]" : "text-red-400 font-extrabold text-2xl animate-[shake_0.7s]"}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {judgement}
              </motion.span>
              <motion.span
                className="ml-2 italic text-gray-400 text-base mt-1 animate-[fadeIn_1.2s]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {reason}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              className="mt-4 text-lg flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.p
                className="font-semibold text-red-400 text-3xl animate-[shake_0.7s]"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Game Over!
              </motion.p>
              <motion.button
                onClick={resetGame}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white rounded-xl font-bold shadow-lg"
                style={{ cursor: 'pointer' }}
                whileHover={{ scale: 1.03, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="glass-history"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="gradient-title font-bold mb-3 text-xl text-center">Move History</h2>
          <ul className="list-none pl-0">
            <AnimatePresence>
              {moves.map((move, i) => (
                <motion.li
                  key={i}
                  className="glass-move animate-[fadeIn_0.7s]"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 150 }}
                >
                  <span>{i === 0 ? "Start:" : `Move ${i}:`}</span>
                  <span className="text-gray-200">{move}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      </motion.div>
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .glass-card {
          background: rgba(30, 30, 40, 0.85);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(8px);
        }
        .gradient-btn {
          cursor: pointer !important;
        }
      `}</style>
  </motion.div>
  );
}

