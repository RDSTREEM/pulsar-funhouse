// This is a mapping of game slugs to their status and AI usage
// You can update this as you polish or finish games
export type GameMeta = {
  [slug: string]: {
    status: "ready" | "in-progress" | "ai";
  };
};

export const gameMeta: GameMeta = {
  "rock-paper-scissors": { status: "ai" },
  "tic-tac-toe": { status: "ready" },
  "gebeta": { status: "ready" },
  "typing-test": { status: "ready" },
  "maths-duel": { status: "in-progress" },
  "pictonary": { status: "in-progress" },
  "karaoke": { status: "in-progress" },
  "two-cars": { status: "ready" },
  "flappy-bird": { status: "ready" },
  "truth_or_tech": { status: "ai" },
};
