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
    <main className="flex flex-col items-center justify-center min-h-screen text-center gap-6 p-8 bg-gray-950">
      <h1 className="text-4xl font-bold text-white">Funhouse</h1>
      <DailySection streak={streak} onPuzzleSolved={onPuzzleSolved} />
      <p className="text-lg text-gray-300">Pick a game to play:</p>
      <div className="flex flex-wrap gap-6 justify-center">
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
    </main>
  );
}
