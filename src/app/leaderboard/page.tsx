import StreakLeaderboard from "@/components/StreakLeaderboard";

export default function LeaderboardPage() {
  return (
    <main className="glass-main mt-16">
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="gradient-title text-5xl mb-6">Leaderboard</h1>
        <StreakLeaderboard />
      </div>
    </main>
  );
}
