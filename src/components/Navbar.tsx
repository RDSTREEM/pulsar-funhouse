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

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="glass-nav absolute top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 shadow-lg backdrop-blur-lg pointer-events-auto">
      <Link href="/" className="gradient-title text-2xl sm:text-3xl animate-[tada_1.2s]">
        Pulsar
      </Link>
      {/* Hamburger for mobile */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg border border-purple-700/40 bg-gray-900/60"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className={`block w-6 h-0.5 bg-purple-400 mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-pink-400 mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-400 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      {/* Menu */}
      <div
        className={`flex-col sm:flex-row flex items-center gap-4 sm:gap-6 absolute sm:static top-full left-0 w-full sm:w-auto bg-gray-900/95 sm:bg-transparent px-4 sm:px-0 py-4 sm:py-0 shadow-lg sm:shadow-none transition-all duration-300 z-40 ${menuOpen ? 'flex' : 'hidden sm:flex'}`}
      >
        {user ? (
          <>
            <span className="text-base text-gray-300 font-medium flex items-center gap-2">
              Hi, <span className="text-pink-400 font-bold">{user.email}</span>
              {typeof streak === "number" && (
                <span className="glass-badge ml-2">🔥 Streak: {streak}</span>
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
    </nav>
  );
}
