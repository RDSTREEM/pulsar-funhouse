"use client";

import GameSection from "../components/GameSection";
import DailySection from "../components/DailySection";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { submitWinStreak } from "../lib/utils/submitWinStreak";
import { User } from "@supabase/supabase-js";

type Game = {
  slug: string;
  name: string;
  description: string;
  url: string;
  image?: string;
  badge?: string;
  status: "ready" | "in-progress" | "ai";
};

type GameSectionGame = {
  name: string;
  description: string;
  link: string;
  image?: string;
  badge?: string;
  aiPowered?: boolean;
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [lastDailyResult, setLastDailyResult] = useState<{
    correct: boolean;
    correctAnswer?: string;
  } | null>(null);

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

  function onPuzzleSolved(correct: boolean, correctAnswer?: string) {
    if (correct) {
      setStreak((prev) => {
        const next = prev + 1;
        localStorage.setItem("daily-streak", next.toString());
        if (user) {
          submitWinStreak("daily_streak", user, next);
        }
        return next;
      });
    }
    setLastDailyResult({ correct, correctAnswer });
  }

  const readyGames: GameSectionGame[] = games
    .filter((g) => g.status === "ready")
    .map((g) => ({
      name: g.name,
      description: g.description,
      link: g.url,
      image: g.image,
      badge: g.badge,
    }));

  const inProgressGames: GameSectionGame[] = games
    .filter((g) => g.status === "in-progress")
    .map((g) => ({
      name: g.name,
      description: g.description,
      link: g.url,
      image: g.image,
      badge: g.badge,
    }));

  const aiGames: GameSectionGame[] = games
    .filter((g) => g.status === "ai")
    .map((g) => ({
      name: g.name,
      description: g.description,
      link: g.url,
      image: g.image,
      badge: g.badge,
      aiPowered: true,
    }));

  return (
    <main className="glass-main mt-16">
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="gradient-title text-6xl mb-4 animate-[tada_1.5s]">
          Funhouse
        </h1>

        {/* Daily Puzzle */}
        <DailySection
          streak={streak}
          onPuzzleSolved={(correct, correctAnswer) =>
            onPuzzleSolved(correct, correctAnswer)
          }
        />
        {lastDailyResult && !lastDailyResult.correct && (
          <div className="text-red-400 mt-2">
            Wrong! The correct answer was:{" "}
            <span className="font-semibold">
              {lastDailyResult.correctAnswer}
            </span>
          </div>
        )}
        {lastDailyResult && lastDailyResult.correct && (
          <div className="text-green-400 mt-2">
            Correct
          </div>
        )}

        <p className="text-xl text-gray-300 mb-6 animate-[fadeIn_1.2s]">
          Pick a game to play:
        </p>

        {/* Game Sections */}
        <GameSection title="Ready to Play" games={readyGames} />
        <GameSection title="In Progress" games={inProgressGames} />
        <GameSection
          title="AI Powered (May not work if out of tokens)"
          games={aiGames}
        />
      </div>
    </main>
  );
}
