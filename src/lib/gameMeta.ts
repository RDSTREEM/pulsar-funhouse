// This is a mapping of game slugs to their status and AI usage
// You can update this as you polish or finish games
export type GameMeta = {
  [slug: string]: {
    status: "ready" | "in-progress" | "ai";
  };
};

export const gameMeta: GameMeta = {
  "rock-paper-scissors": { status: "ready" },
  "tic-tac-toe": { status: "ready" },
  "gebeta": { status: "ready" },
  "typing-test": { status: "ready" },
  "maths-duel": { status: "ready" },
  "pictonary": { status: "in-progress" },
  "karaoke": { status: "in-progress" },
  "two-cars": { status: "in-progress" },
  "flappy-bird": { status: "ready" },
  "truth_or_tech": { status: "ai" }, // AI powered
};
