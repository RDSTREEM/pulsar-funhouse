import React, { useState } from "react";

// Ultimate Tic Tac Toe: 3x3 grid of 3x3 boards
const BOARD_SIZE = 3;

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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function SmallBoard({board, onMove, disabled, winner}: {
  board: string[],
  onMove: (i: number) => void,
  disabled: boolean,
  winner: string | null
}) {
  return (
    <div className={`grid grid-cols-3 gap-1 border-2 rounded p-1 ${winner ? 'bg-green-100' : ''}`}
         style={{width: 80, height: 80}}>
      {board.map((cell, i) => (
        <button
          key={i}
          className="w-6 h-6 text-xs border bg-white"
          onClick={() => onMove(i)}
          disabled={!!cell || disabled || !!winner}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}

export default function SuperTicTacToe() {
  // 9 small boards, each with 9 cells
  const [boards, setBoards] = useState(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [bigBoard, setBigBoard] = useState(Array(9).fill(null));
  const [nextBoard, setNextBoard] = useState<number | null>(null);
  const [isXNext, setIsXNext] = useState(true);
  const bigWinner = calculateWinner(bigBoard);

  function handleMove(boardIdx: number, cellIdx: number) {
    if (bigWinner) return;
    if (nextBoard !== null && nextBoard !== boardIdx) return;
    if (bigBoard[boardIdx]) return;
    if (boards[boardIdx][cellIdx]) return;
    const newBoards = boards.map(arr => arr.slice());
    newBoards[boardIdx][cellIdx] = isXNext ? "X" : "O";
    // Check if small board is won
    const smallWinner = calculateWinner(newBoards[boardIdx]);
    const newBigBoard = bigBoard.slice();
    if (smallWinner) newBigBoard[boardIdx] = smallWinner;
    setBoards(newBoards);
    setBigBoard(newBigBoard);
    setIsXNext(!isXNext);
    // Next board is determined by cellIdx
    if (!newBigBoard[cellIdx]) {
      setNextBoard(cellIdx);
    } else {
      setNextBoard(null); // Any board
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Ultimate Tic Tac Toe</h3>
      <div className="mb-2 text-sm max-w-md">
        <strong>How to Play:</strong> Play on a 3x3 grid of 3x3 boards. Your move in a small board sends your opponent to the corresponding board for their next move. Win a small board to claim it. Win three small boards in a row to win the game.
      </div>
      <div className="grid grid-cols-3 gap-2">
        {boards.map((board, i) => (
          <SmallBoard
            key={i}
            board={board}
            onMove={cellIdx => handleMove(i, cellIdx)}
            disabled={nextBoard !== null && nextBoard !== i || !!bigBoard[i] || !!bigWinner}
            winner={bigBoard[i]}
          />
        ))}
      </div>
      <div className="mt-4 text-md">
        {bigWinner ? `Winner: ${bigWinner}` : `Turn: ${isXNext ? "X" : "O"}`}
      </div>
      <div className="mt-2 text-xs text-gray-500">Your move determines your opponent's next board!</div>
    </div>
  );
}
