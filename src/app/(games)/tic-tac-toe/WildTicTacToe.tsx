import React, { useState } from "react";

const BOARD_SIZE = 3;

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
      board[b[0]][b[1]] === board[c[0]][c[1]]
    ) return board[a[0]][a[1]];
  }
  return null;
}

export default function WildTicTacToe() {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [turn, setTurn] = useState("X");
  const winner = checkWinner(board);

  function handleClick(row: number, col: number, symbol: string) {
    if (board[row][col] || winner) return;
    const newBoard = board.map(arr => arr.slice());
    newBoard[row][col] = symbol;
    setBoard(newBoard);
    setTurn(turn === "X" ? "O" : "X");
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Wild Tic Tac Toe</h3>
      <div className="mb-2 text-sm max-w-md">
        <strong>How to Play:</strong> On each turn, you can choose to play either X or O in any empty cell. The first to get three of the same symbol in a row wins. Use strategy to block and create opportunities!
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div key={i + "-" + j} className="flex flex-col items-center">
              <button
                className="w-12 h-12 text-xl border bg-white mb-1"
                disabled={!!cell || !!winner}
                onClick={() => handleClick(i, j, "X")}
              >
                {cell === null ? "X" : cell}
              </button>
              <button
                className="w-12 h-12 text-xl border bg-white"
                disabled={!!cell || !!winner}
                onClick={() => handleClick(i, j, "O")}
              >
                {cell === null ? "O" : cell}
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 text-md">
        {winner ? `Winner: ${winner}` : `Next: ${turn} (choose)`}
      </div>
    </div>
  );
}
