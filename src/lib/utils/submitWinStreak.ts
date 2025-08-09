import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Submits a user's win streak for a game to Supabase, keeping only their best streak.
 * @param gameName The name of the game.
 * @param user The Supabase user object.
 * @param streak The win streak to submit.
 * @returns Promise resolving to the upserted leaderboard entry or error.
 */
export async function submitWinStreak(gameName: string, user: User, streak: number) {
  if (!user) throw new Error("User must be logged in");
  // Check current best streak
  const { data: existing, error: fetchError } = await supabase
    .from("leaderboards")
    .select("*")
    .eq("game_name", gameName)
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { error: fetchError };
  }

  if (!existing || streak > existing.score) {
    // Insert or update with new best streak
    const { data, error } = await supabase
      .from("leaderboards")
      .upsert([
        {
          game_name: gameName,
          user_id: user.id,
          username: user.email || user.id,
          score: streak,
        },
      ], { onConflict: "game_name,user_id" });
    return { data, error };
  }
  // No update needed, streak not better
  return { data: existing, error: null };
}
