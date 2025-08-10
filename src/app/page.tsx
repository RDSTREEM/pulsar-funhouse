"use client";

import GameSection from "../components/GameSection";
import DailySection from "../components/DailySection";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { submitWinStreak } from "../lib/utils/submitWinStreak";
import StreakLeaderboard from "../components/StreakLeaderboard";

import { gameMeta } from "../lib/gameMeta";

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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/games.json")
      .then((res) => res.json())
      .then((data) => setGames(data));
    setLoggedIn(!!localStorage.getItem("sb-access-token"));
    const saved = localStorage.getItem("daily-streak");
    setStreak(saved ? parseInt(saved) : 0);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  async function onPuzzleSolved() {
    setStreak((prev) => {
      const next = prev + 1;
      localStorage.setItem("daily-streak", next.toString());
      // Sync to Supabase leaderboard
      if (user) {
        submitWinStreak("daily_streak", user, next);
      }
      return next;
    });
  }

  // Categorize games
  const readyGames = games.filter(g => gameMeta[g.slug]?.status === "ready").map(g => ({
    name: g.name,
    description: g.description,
    link: g.url,
  }));
  const inProgressGames = games.filter(g => gameMeta[g.slug]?.status === "in-progress").map(g => ({
    name: g.name,
    description: g.description,
    link: g.url,
  }));
  const aiGames = games.filter(g => gameMeta[g.slug]?.status === "ai").map(g => ({
    name: g.name,
    description: g.description,
    link: g.url,
    aiPowered: true,
  }));

  return (
    <main className="glass-main mt-16">
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="gradient-title text-6xl mb-4 animate-[tada_1.5s]">Funhouse</h1>
  <DailySection streak={streak} onPuzzleSolved={onPuzzleSolved} />
  <p className="text-xl text-gray-300 mb-6 animate-[fadeIn_1.2s]">Pick a game to play:</p>
        <GameSection title="Ready to Play" games={readyGames} />
        <GameSection title="In Progress" games={inProgressGames} />
        <GameSection title="AI Powered (May not work if out of tokens)" games={aiGames} />
      </div>
    </main>
  );
}
