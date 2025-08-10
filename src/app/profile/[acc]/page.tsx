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
    if (acc) fetchProfile();
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
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Username:</label>
        {editing ? (
          <input
            className="glass-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        ) : (
          <span className="text-lg">{profile?.username}</span>
        )}
        <button
          className="gradient-btn ml-4 px-3 py-1"
          onClick={() => (editing ? saveProfile() : setEditing(true))}
        >
          {editing ? "Save" : "Edit"}
        </button>
      </div>
      {/* Add more profile fields here */}
    </div>
  );
}
