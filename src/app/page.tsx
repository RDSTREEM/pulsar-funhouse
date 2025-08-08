import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Funhouse</h1>
      <p className="text-lg text-gray-300">Pick a game to play:</p>
      <Link href="/tic-tac-toe" className="text-blue-400 hover:underline text-xl">
        → Tic Tac Toe
      </Link>
      <Link href="/rock-paper-scissors" className="text-blue-400 hover:underline text-xl">
        → Rock Paper Scissors
      </Link>
    </main>
  );
}
