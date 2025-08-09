
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";

type LeaderboardEntry = {
  user_id: string;
  username?: string;
  score: number;
};

type Leaderboard = {
  id: string;
  game_name: string;
  entries: LeaderboardEntry[];
};

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboards() {
      setLoading(true);
      // Fetch all leaderboards from supabase
      const { data, error } = await supabase.from("leaderboards").select("*");
      if (!error && Array.isArray(data)) setLeaderboards(data as Leaderboard[]);
      setLoading(false);
    }
    fetchLeaderboards();
  }, []);

  return (
    <div className="glass-section p-8 max-w-3xl mx-auto mt-8">
      <h1 className="gradient-title text-2xl mb-4">Leaderboards</h1>
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : leaderboards.length === 0 ? (
        <p className="text-gray-300">No leaderboards available.</p>
      ) : (
        <div>
          {leaderboards.map((lb: Leaderboard) => (
            <div key={lb.id} className="mb-8">
              <h2 className="gradient-title text-xl mb-2">{lb.game_name}</h2>
              <ol className="list-decimal ml-6">
                {lb.entries.map((entry: LeaderboardEntry) => (
                  <li key={entry.user_id} className="text-gray-200">
                    {entry.username || entry.user_id}: <span className="font-bold text-pink-400">{entry.score}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
