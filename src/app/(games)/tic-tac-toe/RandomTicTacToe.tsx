import React, { useState } from "react";

const BOARD_SIZE = 3;
const BLOCKED = "X";

function checkWinner(board: (string | null)[][]): string | null {
  const lines = [
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
  ];
  for (let line of lines) {
    const [a,b,c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[b[0]][b[1]] === board[c[0]][c[1]] &&
      board[a[0]][a[1]] !== BLOCKED
    ) return board[a[0]][a[1]];
  }
  return null;
}

function getRandomBlockedCells(): [number, number][] {
  const cells: [number, number][] = [];
  while (cells.length < 2) {
    const r = Math.floor(Math.random() * BOARD_SIZE);
    const c = Math.floor(Math.random() * BOARD_SIZE);
    if (!cells.some(([x, y]) => x === r && y === c)) {
      cells.push([r, c]);
    }
  }
  return cells;
}

export default function RandomTicTacToe() {
  const [blocked] = useState(getRandomBlockedCells());
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [xIsNext, setXIsNext] = useState(true);
  const winner = checkWinner(board);

  function handleClick(row: number, col: number) {
    if (board[row][col] || winner || blocked.some(([r, c]) => r === row && c === col)) return;
    const newBoard = board.map(arr => arr.slice());
    newBoard[row][col] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Randomized Board Tic Tac Toe</h3>
      <div className="mb-2 text-sm max-w-md">
        <strong>How to Play:</strong> Some cells are blocked randomly at the start and cannot be used. Play as X and O, trying to get three in a row. Use strategy to work around blocked spaces!
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, i) =>
          row.map((cell, j) => {
            const isBlocked = blocked.some(([r, c]) => r === i && c === j);
            return (
              <button
                key={i + "-" + j}
                className={`w-12 h-12 text-xl border ${isBlocked ? "bg-gray-400" : "bg-white"}`}
                onClick={() => handleClick(i, j)}
                disabled={isBlocked}
              >
                {isBlocked ? "🚫" : cell}
              </button>
            );
          })
        )}
      </div>
      <div className="mt-4 text-md">
        {winner ? `Winner: ${winner}` : `Next: ${xIsNext ? "X" : "O"}`}
      </div>
      <div className="mt-2 text-xs text-gray-500">Some cells are blocked randomly at the start!</div>
    </div>
  );
}
