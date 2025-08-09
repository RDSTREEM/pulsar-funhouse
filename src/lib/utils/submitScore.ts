import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Submits a user's score for a game to Supabase, keeping only their best score.
 * @param gameName The name of the game.
 * @param user The Supabase user object.
 * @param score The score to submit.
 * @returns Promise resolving to the upserted leaderboard entry or error.
 */
export async function submitScore(gameName: string, user: User, score: number) {
  if (!user) throw new Error("User must be logged in");
  // Check current best score
  const { data: existing, error: fetchError } = await supabase
    .from("leaderboards")
    .select("*")
    .eq("game_name", gameName)
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows found
    return { error: fetchError };
  }

  if (!existing || score > existing.score) {
    // Insert or update with new best score
    const { data, error } = await supabase
      .from("leaderboards")
      .upsert([
        {
          game_name: gameName,
          user_id: user.id,
          username: user.email || user.id,
          score,
        },
  ], { onConflict: "game_name,user_id" });
    return { data, error };
  }
  // No update needed, score not better
  return { data: existing, error: null };
}
