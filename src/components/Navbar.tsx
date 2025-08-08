"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900">
      <Link href="/" className="text-xl font-bold text-white">
        🎮 Funhouse
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/tic-tac-toe">Tic Tac Toe</Link>
        <Link href="/rock-paper-scissors">RPS</Link>
        <Link href="/leaderboard">🏆 Leaderboard</Link>
        {user ? (
          <>
            <span className="text-sm text-gray-400">Hi, {user.email}</span>
            <button onClick={handleLogout} className="text-red-400 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline text-blue-400">
              Login
            </Link>
            <Link href="/signup" className="hover:underline text-blue-400">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
