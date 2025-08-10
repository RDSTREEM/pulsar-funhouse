"use client";

import { useState, useEffect } from "react";

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

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);

  // CPU Move Effect
  useEffect(() => {
    if (!isXNext && !winner) {
      const emptyIndices = board
        .map((cell, idx) => (cell === null ? idx : null))
        .filter((idx): idx is number => idx !== null);

      if (emptyIndices.length === 0) return;

      // Simple CPU picks random empty cell after small delay
      const cpuMove = () => {
        const randomIndex =
          emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const newBoard = board.slice();
        newBoard[randomIndex] = "O";
        setBoard(newBoard);
        setIsXNext(true);
      };

      const timer = setTimeout(cpuMove, 500); // CPU waits 500ms to move
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, winner]);

  function handleClick(index: number) {
    if (board[index] || winner || !isXNext) return; // block if not player turn or game ended
    const newBoard = board.slice();
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  return (
    <div className="text-center w-full">
      <h1 className="gradient-title text-4xl mb-6">Tic Tac Toe vs CPU</h1>
      <div className="mb-2 text-sm max-w-md mx-auto">
        <strong>How to Play:</strong> You play as X. The CPU plays O. Click a square to make your move.
      </div>
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
          : `Turn: ${isXNext ? "Your (X)" : "CPU (O)"}`}
      </div>
      <button className="gradient-btn mt-6 px-6 py-2" onClick={resetGame}>
        Restart
      </button>
    </div>
  );
}
