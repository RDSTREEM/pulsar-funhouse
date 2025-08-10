"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const { acc } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", acc)
        .single();
      setProfile(data);
      setUsername(data?.username || "");
      setLoading(false);
    }
    async function fetchEmail() {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email || "");
    }
    if (acc) {
      fetchProfile();
      fetchEmail();
    }
  }, [acc]);

  async function saveProfile() {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", acc);
    setEditing(false);
    setLoading(false);
    if (!error) setProfile((p: any) => ({ ...p, username }));
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="glass-card w-full max-w-lg mx-auto p-8 rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-500 flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl text-white font-bold">{profile?.username?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <h1 className="text-3xl font-extrabold gradient-title mb-2">{profile?.username || 'Profile'}</h1>
          {email && (
            <span className="text-base text-gray-300 font-medium mb-2">{email}</span>
          )}
          <div className="flex gap-4 mt-2">
            <span className="glass-badge">🔥 Streak: {profile?.streak ?? 0}</span>
            <span className="glass-badge">🏆 Longest: {profile?.longest_streak ?? 0}</span>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mb-4">
          <label className="block mb-2 font-semibold text-purple-300">Username</label>
          <div className="flex items-center w-full justify-center">
            {editing ? (
              <input
                className="glass-input w-40"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            ) : (
              <span className="text-lg text-white font-semibold">{profile?.username}</span>
            )}
            <button
              className="gradient-btn ml-4 px-3 py-1"
              onClick={() => (editing ? saveProfile() : setEditing(true))}
            >
              {editing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
        {/* Add more profile fields here */}
      </div>
    </div>
  );
}
