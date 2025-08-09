'use client';

import { useState } from 'react';

const ROWS = 2;
const PITS_PER_ROW = 6;
const INITIAL_SEEDS = 4;

function newBoard() {
  return Array(ROWS * PITS_PER_ROW).fill(INITIAL_SEEDS);
}

function pitOwner(index: number) {
  return index < PITS_PER_ROW ? 0 : 1;
}

function sideEmpty(b: number[], player: number) {
  const start = player === 0 ? 0 : PITS_PER_ROW;
  return b.slice(start, start + PITS_PER_ROW).every(v => v === 0);
}

export default function GebetaBoard() {
  const [board, setBoard] = useState<number[]>(newBoard());
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState('Player 0 turn');

  function reset() {
    setBoard(newBoard());
    setScores([0, 0]);
    setCurrent(0);
    setMessage('Player 0 turn');
  }

  function onPick(pitIndex: number) {
    if (sideEmpty(board, 0) || sideEmpty(board, 1)) return;
    if (pitOwner(pitIndex) !== current) {
      setMessage(`Not your pit — Player ${current}`);
      return;
    }
    if (board[pitIndex] === 0) {
      setMessage('Choose a non-empty pit');
      return;
    }

    let b = [...board];
    let stones = b[pitIndex];
    b[pitIndex] = 0;
    let idx = pitIndex;
    while (stones > 0) {
      idx = (idx + 1) % (ROWS * PITS_PER_ROW);
      b[idx] += 1;
      stones -= 1;
    }

    const opponent = 1 - current;
    let newScores = [...scores] as [number, number];
    let captured = 0;

    if (pitOwner(idx) === opponent) {
      let scan = idx;
      while (
        pitOwner(scan) === opponent &&
        (b[scan] === 2 || b[scan] === 3)
      ) {
        captured += b[scan];
        b[scan] = 0;
        scan = (scan - 1 + ROWS * PITS_PER_ROW) % (ROWS * PITS_PER_ROW);
      }
    }

    if (captured > 0) {
      newScores = [...newScores];
      newScores[current] += captured;
    }

    if (sideEmpty(b, 0) || sideEmpty(b, 1)) {
      const remaining0 = b.slice(0, PITS_PER_ROW).reduce((a, c) => a + c, 0);
      const remaining1 = b.slice(PITS_PER_ROW).reduce((a, c) => a + c, 0);
      newScores[0] += remaining0;
      newScores[1] += remaining1;
      b = Array(b.length).fill(0);
      setBoard(b);
      setScores(newScores);
      setMessage(`Game over — P0: ${newScores[0]} — P1: ${newScores[1]}`);
      return;
    }

    setBoard(b);
    setScores(newScores);
    setCurrent(opponent);
    setMessage(`Player ${opponent} turn`);
  }

  function renderPit(i: number) {
    return (
      <button
        key={i}
        onClick={() => onPick(i)}
        className={`flex items-center justify-center rounded-xl border border-gray-400 bg-white text-lg font-semibold shadow-sm hover:bg-gray-50 transition w-16 h-16 sm:w-20 sm:h-20 ${
          pitOwner(i) === 0 ? '' : 'rotate-180'
        }`}
      >
        {board[i]}
      </button>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="flex justify-between mb-4 text-sm sm:text-base">
        <div className="text-pink-400 font-bold">Player 1 (top): {scores[1]}</div>
        <div className="text-purple-400 font-bold">Player 0 (bottom): {scores[0]}</div>
      </div>

      <div className="glass-section p-4">
        <div className="flex justify-between mb-2">
          {board
            .slice(PITS_PER_ROW, PITS_PER_ROW * 2)
            .map((_, idx) =>
              renderPit(PITS_PER_ROW + (PITS_PER_ROW - 1 - idx))
            )}
        </div>
        <div className="flex justify-between mt-2">
          {board.slice(0, PITS_PER_ROW).map((_, idx) => renderPit(idx))}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-gray-200 font-medium">{message}</div>
        <button
          onClick={reset}
          className="gradient-btn px-6 py-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
