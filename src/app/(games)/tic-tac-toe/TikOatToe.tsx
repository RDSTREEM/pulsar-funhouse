import React, { useState } from "react";

// Oats Jenkins Tik Oat Toe: 3x3 board, but you can place oats (neutral pieces)
const BOARD_SIZE = 3;
const OAT = "Oat";

function checkWinner(board: (string | null)[][]): string | null {
  // Only X or O can win
  const lines = [
    // Rows
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    // Columns
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    // Diagonals
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
  ];
  for (let line of lines) {
    const [a,b,c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[b[0]][b[1]] === board[c[0]][c[1]] &&
      board[a[0]][a[1]] !== OAT
    ) return board[a[0]][a[1]];
  }
  return null;
}

export default function TikOatToe() {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [turn, setTurn] = useState("X");
  const winner = checkWinner(board);

  function handleClick(row: number, col: number) {
    if (board[row][col] || winner) return;
    const newBoard = board.map(arr => arr.slice());
    if (turn === OAT) {
      newBoard[row][col] = OAT;
      setTurn("X");
    } else {
      newBoard[row][col] = turn;
      setTurn(turn === "X" ? "O" : OAT);
    }
    setBoard(newBoard);
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Oats Jenkins Tik Oat Toe</h3>
      <div className="mb-2 text-sm max-w-md">
        <strong>How to Play:</strong> Players alternate turns as X, O, and Oat. Oat is a neutral piece and cannot win. The first player to get three Xs or Os in a row wins. Oats block spaces but do not count for victory.
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <button
              key={i + "-" + j}
              className="w-12 h-12 text-xl border bg-white"
              onClick={() => handleClick(i, j)}
            >
              {cell === OAT ? "🥣" : cell}
            </button>
          ))
        )}
      </div>
      <div className="mt-4 text-md">
        {winner ? `Winner: ${winner}` : `Next: ${turn}`}
      </div>
      <div className="mt-2 text-xs text-gray-500">Oat = neutral piece, cannot win</div>
    </div>
  );
}
