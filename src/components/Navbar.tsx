"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type NavbarProps = {
  streak?: number;
};

export default function Navbar({ streak }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);

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
    <nav className="relative flex items-center justify-between px-8 py-4 bg-gray-900/80 backdrop-blur-xl border-b-2 border-purple-700/40 shadow-lg z-20">
      <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-[tada_1.2s]">
        Pulsar
      </Link>
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <span className="text-base text-gray-300 font-medium flex items-center gap-2">
              Hi, <span className="text-pink-400 font-bold">{user.email}</span>
              {typeof streak === "number" && (
                <span className="ml-2 px-3 py-1 bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-400 text-white rounded-full text-xs font-bold shadow animate-pulse border border-yellow-400/40">🔥 Streak: {streak}</span>
              )}
            </span>
            <button onClick={handleLogout} className="text-red-400 font-bold px-4 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/70 transition-colors shadow-lg animate-[wiggle_1.5s_ease-in-out_infinite]">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-blue-900/40 text-blue-400 font-bold hover:bg-blue-900/70 transition-colors shadow-lg animate-[wiggle_1.5s_ease-in-out_infinite]">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-pink-900/40 text-pink-400 font-bold hover:bg-pink-900/70 transition-colors shadow-lg animate-[wiggle_1.5s_ease-in-out_infinite]">
              Sign Up
            </Link>
          </>
        )}
      </div>
      <style jsx global>{`
        @keyframes tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </nav>
  );
}
