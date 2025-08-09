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
    <main className="glass-main">
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="gradient-title text-6xl mb-4 animate-[tada_1.5s]">Funhouse</h1>
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
    </main>
  );
}
