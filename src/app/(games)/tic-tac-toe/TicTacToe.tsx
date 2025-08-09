"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { submitWinStreak } from "@/lib/utils/submitWinStreak";
import type { User } from "@supabase/supabase-js";
import "@/../public/assets/tic-tac-toe/style.css";

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [lastWinner, setLastWinner] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const winner = calculateWinner(board);

  useEffect(() => {
    if (winner && user) {
      // Only count streak for logged-in user playing as X
      if (winner === "X") {
  }
      setLastWinner(winner);
    }
    if (!winner && board.every(Boolean)) {
      setLastWinner(null);
    }
  }, [winner, user]);

  function handleClick(index: number) {
    if (board[index] || winner) return;
    const newBoard = board.slice();
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  return (
    <div className="text-center w-full">
      <h1 className="gradient-title text-4xl mb-6">Tic Tac Toe</h1>
      <div className="grid grid-cols-3 gap-2 justify-center items-center mx-auto mb-6 w-64">
        {board.map((cell, i) => (
          <button
            key={i}
            className="glass-card flex items-center justify-center w-20 h-20 text-3xl font-bold transition-transform duration-150 hover:scale-105 focus:outline-none"
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>
      <div className="mt-4 text-lg text-gray-200">
        {winner
          ? `Winner: ${winner}`
          : board.every(Boolean)
          ? "It's a draw!"
          : `Turn: ${isXNext ? "X" : "O"}`}
      </div>
      <button
        className="gradient-btn mt-6 px-6 py-2"
        onClick={resetGame}
      >
        Restart
      </button>
    </div>
  );
}

function calculateWinner(squares: string[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default TicTacToe;
