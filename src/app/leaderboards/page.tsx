
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboards</h1>
      {loading ? (
        <p>Loading...</p>
      ) : leaderboards.length === 0 ? (
        <p>No leaderboards available.</p>
      ) : (
        <div>
          {leaderboards.map((lb: Leaderboard) => (
            <div key={lb.id} className="mb-8">
              <h2 className="text-xl font-semibold mb-2">{lb.game_name}</h2>
              <ol className="list-decimal ml-6">
                {lb.entries.map((entry: LeaderboardEntry) => (
                  <li key={entry.user_id}>
                    {entry.username || entry.user_id}: {entry.score}
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
