"use client";
import GameCard from "../components/GameCard";
import { useEffect, useState } from "react";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    fetch("/games.json")
      .then((res) => res.json())
      .then((data) => setGames(data));
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center gap-6 p-8 bg-gray-950">
      <h1 className="text-4xl font-bold text-white">Funhouse</h1>
      <p className="text-lg text-gray-300">Pick a game to play:</p>
      <div className="flex flex-wrap gap-6 justify-center">
        {games.map((game) => (
          <GameCard
            key={game.slug}
            name={game.name}
            description={game.description}
            url={game.url}
            image={game.image}
          />
        ))}
      </div>
    </main>
  );
}
