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
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(() => {
    // Persist streak in localStorage
    const saved = localStorage.getItem("daily-streak");
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    fetch("/games.json")
      .then((res) => res.json())
      .then((data) => setGames(data));
    setLoggedIn(!!localStorage.getItem("sb-access-token"));
  }, []);

  useEffect(() => {
    localStorage.setItem("daily-streak", streak.toString());
  }, [streak]);

  function handlePuzzleSolved() {
    setStreak((prev) => prev + 1);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center gap-6 p-8 bg-gray-950">
      <h1 className="text-4xl font-bold text-white">Funhouse</h1>
      <DailySection streak={streak} onPuzzleSolved={handlePuzzleSolved} />
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
