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
    <nav className="flex items-center justify-between p-4 bg-gray-900">
      <Link href="/" className="text-xl font-bold text-white">
        Pulsar
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-400">Hi, {user.email}
              {typeof streak === "number" && (
                <span className="ml-2 px-2 py-1 bg-yellow-600 text-white rounded text-xs">🔥 Streak: {streak}</span>
              )}
            </span>
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
