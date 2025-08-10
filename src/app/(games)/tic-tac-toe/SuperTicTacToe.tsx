"use client";

import React, { useState, useEffect } from "react";

function calculateWinner(squares: string[]): string | null {
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
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

function SmallBoard({
  board,
  onMove,
  disabled,
  winner,
  highlight,
}: {
  board: string[];
  onMove: (i: number) => void;
  disabled: boolean;
  winner: string | null;
  highlight: boolean;
}) {
  return (
    <div
      className={`p-1 rounded-md border transition-shadow relative
        ${
          winner
            ? "bg-red-900 border-red-500 shadow-lg"
            : "bg-gray-800 border-gray-600"
        }
        ${highlight ? "ring-4 ring-red-500 ring-opacity-80" : ""}
      `}
      style={{ width: 100, height: 100, minWidth: 100, minHeight: 100 }}
    >
      <div
        className="grid grid-cols-3 grid-rows-3 gap-[2px] w-full h-full"
        style={{ 
          // enforce fixed cell sizes inside grid
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => onMove(i)}
            disabled={!!cell || disabled || !!winner}
            aria-label={`Cell ${i + 1} ${cell ? `occupied by ${cell}` : "empty"}`}
            className={`flex items-center justify-center
              rounded-sm border
              transition-colors duration-150
              ${cell === "X" ? "text-blue-400" : ""}
              ${cell === "O" ? "text-pink-400" : ""}
              ${
                !cell && !disabled && !winner
                  ? "hover:bg-red-700 cursor-pointer border-red-700"
                  : "cursor-default border-gray-700"
              }
            `}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              margin: 0,
              fontSize: '1.5rem',
              lineHeight: 1,
              userSelect: "none",
              boxSizing: "border-box",
              backgroundColor:
                cell || winner
                  ? undefined
                  : disabled
                  ? "rgba(255, 100, 100, 0.15)"
                  : undefined,
            }}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}


export default function SuperTicTacToe() {
  const [boards, setBoards] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );
  const [bigBoard, setBigBoard] = useState(Array(9).fill(null));
  const [nextBoard, setNextBoard] = useState<number | null>(null);
  const [isXNext, setIsXNext] = useState(true); // player X, CPU O
  const bigWinner = calculateWinner(bigBoard);

  useEffect(() => {
    if (!isXNext && !bigWinner) {
      const validBoards =
        nextBoard !== null && !bigBoard[nextBoard]
          ? [nextBoard]
          : bigBoard
              .map((cell, idx) => (!cell ? idx : null))
              .filter((idx): idx is number => idx !== null);

      if (validBoards.length === 0) return;

      const chosenBoard =
        validBoards[Math.floor(Math.random() * validBoards.length)];

      const emptyCells = boards[chosenBoard]
        .map((cell, idx) => (cell === null ? idx : null))
        .filter((idx): idx is number => idx !== null);

      if (emptyCells.length === 0) return;

      const chosenCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];

      const timer = setTimeout(() => {
        handleMove(chosenBoard, chosenCell);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isXNext, bigWinner, boards, bigBoard, nextBoard]);

  function handleMove(boardIdx: number, cellIdx: number) {
    if (bigWinner) return;
    if (nextBoard !== null && nextBoard !== boardIdx) return;
    if (bigBoard[boardIdx]) return;
    if (boards[boardIdx][cellIdx]) return;

    const newBoards = boards.map((arr) => arr.slice());
    newBoards[boardIdx][cellIdx] = isXNext ? "X" : "O";

    const smallWinner = calculateWinner(newBoards[boardIdx]);
    const newBigBoard = bigBoard.slice();
    if (smallWinner) newBigBoard[boardIdx] = smallWinner;

    setBoards(newBoards);
    setBigBoard(newBigBoard);
    setIsXNext(!isXNext);

    if (!newBigBoard[cellIdx]) {
      setNextBoard(cellIdx);
    } else {
      setNextBoard(null);
    }
  }

  function resetGame() {
    setBoards(Array(9).fill(null).map(() => Array(9).fill(null)));
    setBigBoard(Array(9).fill(null));
    setNextBoard(null);
    setIsXNext(true);
  }

  return (
    <div className="bg-gray-900 min-h-[calc(80vh)] text-center w-full max-w-sm sm:max-w-lg mx-auto sm:p-6 text-gray-200 select-none rounded-md shadow-lg">
      <h1 className="gradient-title text-2xl sm:text-3xl mb-4 text-red-400 font-extrabold">
        Ultimate Tic Tac Toe vs CPU
      </h1>
      <div className="mb-3 max-w-sm mx-auto text-gray-400 text-xs sm:text-sm">
        <strong>How to Play:</strong> Play on a 3x3 grid of 3x3 boards. Your
        move in a small board sends the CPU to the corresponding board for its
        next move. Win a small board to claim it. Win three small boards in a
        row to win the game.
      </div>

      <div
        className="grid grid-cols-3 mx-auto bg-gray-800 rounded-lg border border-red-600 shadow-md"
        style={{ maxWidth: 310, margin: "0 auto" }}
      >
        {boards.map((board, i) => (
          <SmallBoard
            key={i}
            board={board}
            onMove={(cellIdx) => handleMove(i, cellIdx)}
            disabled={
              (nextBoard !== null && nextBoard !== i) ||
              !!bigBoard[i] ||
              !!bigWinner ||
              !isXNext
            }
            winner={bigBoard[i]}
            highlight={nextBoard === i && !bigWinner}
          />
        ))}
      </div>

      <div className="mt-4 text-sm sm:text-lg text-red-400 font-semibold min-h-[1.5rem]">
        {bigWinner
          ? `Winner: ${bigWinner}`
          : bigBoard.every(Boolean)
          ? "It's a draw!"
          : `Turn: ${isXNext ? "Your (X)" : "CPU (O)"}`}
      </div>

      <button
        onClick={resetGame}
        className="mt-4 px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors text-gray-100 shadow-md"
      >
        Restart Game
      </button>
    </div>
  );
}
