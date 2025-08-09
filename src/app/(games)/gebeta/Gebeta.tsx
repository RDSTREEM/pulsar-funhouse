
"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  email?: string;
};

type Game = {
  id: string;
  status?: string;
};

type Player = {
  id: string;
  user_id: string;
  username: string;
  score: number;
  is_host: boolean;
};

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

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<number[]>(newBoard());
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState('Player 0 turn');
  const [animating, setAnimating] = useState(false);
  const [movingPebble, setMovingPebble] = useState<{from: number, to: number, key: number} | null>(null);
  const pebbleKey = useRef(0);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
  }, []);

  async function enterQueue() {
    if (!user) return;
    const { error } = await supabase.from('matchmaking_queue').insert([
      {
        user_id: user.id,
        username: user.email || user.id,
      },
    ]);
    if (error) {
      alert('Error entering matchmaking queue: ' + error.message);
      return;
    }
    setInQueue(true);
    // TODO: Add matchmaking logic here
  }

  function reset() {
    setBoard(newBoard());
    setScores([0, 0]);
    setCurrent(0);
    setMessage('Player 0 turn');
  }

  async function animateMove(pitIndex: number) {
    let b = [...board];
    let stones = b[pitIndex];
    b[pitIndex] = 0;
    let idx = pitIndex;
    for (let i = 0; i < stones; i++) {
      idx = (idx + 1) % (ROWS * PITS_PER_ROW);
      setMovingPebble({from: pitIndex, to: idx, key: pebbleKey.current++});
      await new Promise(res => setTimeout(res, 250));
      b[idx] += 1;
      setBoard([...b]);
    }
    setMovingPebble(null);
    return { idx, board: b };
  }

  async function onPick(pitIndex: number) {
    if (animating) return;
    if (sideEmpty(board, 0) || sideEmpty(board, 1)) return;
    if (pitOwner(pitIndex) !== current) {
      setMessage(`Not your pit — Player ${current}`);
      return;
    }
    if (board[pitIndex] === 0) {
      setMessage('Choose a non-empty pit');
      return;
    }
  setAnimating(true);
  const { idx, board: b } = await animateMove(pitIndex);
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
    setBoard(Array(b.length).fill(0));
    setScores(newScores);
    setMessage(`Game over — P0: ${newScores[0]} — P1: ${newScores[1]}`);
    setAnimating(false);
    return;
  }
  setBoard([...b]);
  setScores(newScores);
  setCurrent(opponent);
  setMessage(`Player ${opponent} turn`);
  setAnimating(false);
  }

  function renderPebbles(count: number, pitIdx: number) {
    // Render pebbles as SVG circles, animated on change
    return (
      <div className="flex flex-wrap gap-1 justify-center items-center w-full h-full relative">
        {[...Array(count)].map((_, idx) => (
          <svg key={idx} width="16" height="16" className="pebble-anim" style={{transition: 'transform 0.2s'}}>
            <circle cx="8" cy="8" r="6" fill="#bfa76f" stroke="#8d6e3c" strokeWidth="1" />
          </svg>
        ))}
        {/* Moving pebble animation */}
        {movingPebble && movingPebble.to === pitIdx && (
          <svg key={movingPebble.key} width="16" height="16" className="absolute pebble-move" style={{left: 0, top: 0, animation: 'movePebble 0.25s linear'}}>
            <circle cx="8" cy="8" r="6" fill="#bfa76f" stroke="#8d6e3c" strokeWidth="1" />
          </svg>
        )}
      </div>
    );
  }

  function renderPit(i: number) {
    return (
      <button
        key={i}
        onClick={() => onPick(i)}
        disabled={animating}
        className={`flex items-center justify-center rounded-xl border border-gray-400 bg-white shadow-sm hover:bg-gray-50 transition w-16 h-16 sm:w-20 sm:h-20 ${
          pitOwner(i) === 0 ? '' : 'rotate-180'
        }`}
      >
        {renderPebbles(board[i], i)}
      </button>
    );
  }

  return (
    <div className="w-full max-w-xl">
      {/* How to Play Section */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-300 text-gray-800 shadow">
        <h2 className="font-bold text-lg mb-2">How to Play Gebeta</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Each player owns one row of pits. Players take turns picking a pit from their row.</li>
          <li>Pick a pit with pebbles to distribute them one by one counterclockwise.</li>
          <li>If your last pebble lands in the opponent's pit with 2 or 3 pebbles, you capture those pebbles.</li>
          <li>The game ends when one side is empty. Remaining pebbles go to their owners.</li>
          <li>Highest score wins!</li>
        </ul>
      </div>

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

      {/* Pebble move animation keyframes */}
      <style>{`
        @keyframes movePebble {
          0% { opacity: 1; transform: scale(1) translateY(-30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pebble-move {
          z-index: 10;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
