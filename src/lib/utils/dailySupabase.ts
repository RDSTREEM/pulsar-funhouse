import { supabase } from "@/lib/supabase";

type GeminiContent = {
  fact: string;
  quote: string;
  riddle?: {
    question: string;
    answer: string;
  };
};

export async function getOrCreateDaily(
  date: string,
  fetchGeminiContent: () => Promise<GeminiContent>
) {
  const { data, error } = await supabase
    .from("daily")
    .select()
    .eq("date", date)
    .single();

  if (data) {
    return data;
  }

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
