"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function StreakLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      const { data, error } = await supabase
        .from("leaderboards")
        .select("user_id, username, score")
        .eq("game_name", "daily_streak")
        .order("score", { ascending: false })
        .limit(10);
      setLeaders(data || []);
      setLoading(false);
    }
    fetchLeaders();
  }, []);

  return (
    <section className="glass-section mb-8 w-full max-w-2xl mx-auto p-6">
      <h2 className="gradient-title text-2xl mb-4">Longest Streak Leaderboard</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ol className="list-decimal pl-6">
          {leaders.map((l, i) => (
            <li key={l.user_id} className="mb-2">
              <span className="font-bold">{l.username}</span> — <span className="text-blue-400">{l.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
