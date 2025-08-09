import React, { useState } from "react";

const BOARD_SIZE = 3;

function checkLoser(board: (string | null)[][]): string | null {
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
      board[b[0]][b[1]] === board[c[0]][c[1]]
    ) return board[a[0]][a[1]];
  }
  return null;
}

export default function MisereTicTacToe() {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [xIsNext, setXIsNext] = useState(true);
  const loser = checkLoser(board);

  function handleClick(row: number, col: number) {
    if (board[row][col] || loser) return;
    const newBoard = board.map(arr => arr.slice());
    newBoard[row][col] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Misère Tic Tac Toe</h3>
      <div className="mb-2 text-sm max-w-md">
        <strong>How to Play:</strong> Players take turns as X and O. The first player to get three in a row loses. Try to force your opponent to complete a line!
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <button
              key={i + "-" + j}
              className="w-12 h-12 text-xl border bg-white"
              onClick={() => handleClick(i, j)}
            >
              {cell}
            </button>
          ))
        )}
      </div>
      <div className="mt-4 text-md">
        {loser ? `Loser: ${loser}` : `Next: ${xIsNext ? "X" : "O"}`}
      </div>
      <div className="mt-2 text-xs text-gray-500">Get three in a row and you lose!</div>
    </div>
  );
}
