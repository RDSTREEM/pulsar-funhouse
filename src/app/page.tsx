"use client";

import GameCard from "../components/GameCard";
import DailySection from "../components/DailySection";
import { useEffect, useState } from "react";

type Game = {
  slug: string;
  name: string;
  description: string;
  url: string;
  image?: string;
  badge?: string;
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/games.json")
      .then((res) => res.json())
      .then((data) => setGames(data));
    setLoggedIn(!!localStorage.getItem("sb-access-token"));
    const saved = localStorage.getItem("daily-streak");
    setStreak(saved ? parseInt(saved) : 0);
  }, []);

  function onPuzzleSolved() {
    setStreak((prev) => {
      const next = prev + 1;
      localStorage.setItem("daily-streak", next.toString());
      return next;
    });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-4 py-8 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-purple-700/40 via-pink-500/30 to-blue-500/40 blur-2xl animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-1/2 h-32 bg-gradient-to-l from-pink-500/30 via-purple-700/40 to-blue-500/40 blur-2xl animate-pulse z-0" />
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-[tada_1.5s]">Funhouse</h1>
        <DailySection streak={streak} onPuzzleSolved={onPuzzleSolved} />
        <p className="text-xl text-gray-300 mb-6 animate-[fadeIn_1.2s]">Pick a game to play:</p>
        <div className="flex flex-wrap gap-8 justify-center">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              name={game.name}
              description={game.description}
              url={game.url}
              image={game.image}
              badge={game.badge}
              loggedIn={loggedIn}
            />
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
