import { supabase } from "@/lib/supabase";

export async function getOrCreateDaily(date: string, fetchGeminiContent: () => Promise<any>) {
  // Try to fetch today's daily from Supabase
  const { data, error } = await supabase
    .from("daily")
    .select()
    .eq("date", date)
    .single();

  if (data) {
    return data;
  }

  // If not found, generate new content
  const gemini = await fetchGeminiContent();
  const insert = {
    date,
    fact: gemini.fact,
    quote: gemini.quote,
    riddle_question: gemini.riddle?.question || "",
    riddle_answer: gemini.riddle?.answer || ""
  };
  const { data: newData, error: insertError } = await supabase
    .from("daily")
    .insert([insert])
    .select()
    .single();

  if (insertError) throw insertError;
  return newData;
}
