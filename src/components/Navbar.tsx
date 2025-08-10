"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

type NavbarProps = {
  streak?: number;
};

export default function Navbar({ streak }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
    setMenuOpen(false);
  }

  function handleNavClick() {
    setMenuOpen(false);
  }

  // Helper to check if link is active
  function isActive(href: string) {
    if (href === "/profile" && pathname.startsWith(`/profile`)) return true;
    return pathname === href;
  }

  return (
    <nav className="glass-nav fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-3 sm:py-4 shadow-lg backdrop-blur-lg pointer-events-auto flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex-shrink-0">
        <Link
          href="/"
          className="gradient-title text-2xl sm:text-3xl animate-[tada_1.2s]"
          onClick={handleNavClick}
        >
          Pulsar
        </Link>
      </div>

      {/* Center: Nav Links (desktop) */}
      <div className="hidden sm:flex items-center gap-6">
        <Link
          href="/"
          onClick={handleNavClick}
          className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-center ${
            isActive("/")
              ? "bg-purple-900/70 text-purple-200 ring-2 ring-purple-400"
              : "bg-purple-900/40 text-purple-300 hover:bg-purple-900/70"
          }`}
        >
          Home
        </Link>
        <Link
          href="/leaderboard"
          onClick={handleNavClick}
          className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-center ${
            isActive("/leaderboard")
              ? "bg-purple-900/70 text-purple-200 ring-2 ring-purple-400"
              : "bg-purple-900/40 text-purple-300 hover:bg-purple-900/70"
          }`}
        >
          Leaderboard
        </Link>
        {user && (
          <Link
            href={`/profile/${user.id}`}
            onClick={handleNavClick}
            className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-center ${
              isActive("/profile")
                ? "bg-green-900/70 text-green-200 ring-2 ring-green-400"
                : "bg-green-900/40 text-green-300 hover:bg-green-900/70"
            }`}
          >
            Profile
          </Link>
        )}
      </div>

      {/* Right: Auth Buttons (desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="text-red-400 font-bold px-4 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/70 transition-colors shadow-lg text-center cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-center ${
                isActive("/login")
                  ? "bg-blue-900/70 text-blue-200 ring-2 ring-blue-400"
                  : "bg-blue-900/40 text-blue-400 hover:bg-blue-900/70"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-center ${
                isActive("/signup")
                  ? "bg-pink-900/70 text-pink-200 ring-2 ring-pink-400"
                  : "bg-pink-900/40 text-pink-400 hover:bg-pink-900/70"
              }`}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg border border-purple-700/40 bg-gray-900/60"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span
          className={`block w-6 h-0.5 bg-purple-400 mb-1 transition-all duration-300 ${
            menuOpen ? "rotate-45 translate-y-2" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-pink-400 mb-1 transition-all duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-blue-400 transition-all duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        ></span>
      </button>

      {/* Mobile Menu */}
      <div
        className={`absolute sm:hidden top-0 left-0 w-full h-screen bg-gray-900/95 shadow-lg transition-all duration-500 z-40 overflow-hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ transitionProperty: "opacity" }}
      >
        <div className="flex flex-col items-center gap-4 py-16">
          <Link
            href="/"
            onClick={handleNavClick}
            className={`px-4 py-2 rounded-xl font-bold shadow-lg text-center w-40 ${
              isActive("/")
                ? "bg-purple-900/70 text-purple-200 ring-2 ring-purple-400"
                : "bg-purple-900/40 text-purple-300 hover:bg-purple-900/70"
            }`}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            onClick={handleNavClick}
            className={`px-4 py-2 rounded-xl font-bold shadow-lg text-center w-40 ${
              isActive("/leaderboard")
                ? "bg-purple-900/70 text-purple-200 ring-2 ring-purple-400"
                : "bg-purple-900/40 text-purple-300 hover:bg-purple-900/70"
            }`}
          >
            Leaderboard
          </Link>
          {user && (
            <Link
              href={`/profile/${user.id}`}
              onClick={handleNavClick}
              className={`px-4 py-2 rounded-xl font-bold shadow-lg text-center w-40 ${
                isActive("/profile")
                  ? "bg-green-900/70 text-green-200 ring-2 ring-green-400"
                  : "bg-green-900/40 text-green-300 hover:bg-green-900/70"
              }`}
            >
              Profile
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-red-400 font-bold px-4 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/70 transition-colors shadow-lg text-center w-40"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-xl font-bold shadow-lg text-center w-40 ${
                  isActive("/login")
                    ? "bg-blue-900/70 text-blue-200 ring-2 ring-blue-400"
                    : "bg-blue-900/40 text-blue-400 hover:bg-blue-900/70"
                }`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-xl font-bold shadow-lg text-center w-40 ${
                  isActive("/signup")
                    ? "bg-pink-900/70 text-pink-200 ring-2 ring-pink-400"
                    : "bg-pink-900/40 text-pink-400 hover:bg-pink-900/70"
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
