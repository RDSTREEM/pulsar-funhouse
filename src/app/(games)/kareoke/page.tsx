'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
type KaraokeRoom = {
  id: string;
  song: string;
  lyrics: string;
  scores: { [uid: string]: number };
  players: string[];
};
// ...existing code...
import Pitchfinder from 'pitchfinder';
type Song = {
  id: string;
  title: string;
  ['artist-credit']?: { name: string }[];
};
// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function KaraokePage() {
  // Multiplayer state
  const [roomId, setRoomId] = useState('');
  const [userId] = useState(() => Math.random().toString(36).substring(2, 10)); // random user id for demo
  const [players, setPlayers] = useState<string[]>([]);
  const [roomError, setRoomError] = useState('');
  // Karaoke state
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<{[uid: string]: number}>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scoringRef = useRef(false);

  // Multiplayer: create/join room
  const createRoom = async () => {
    setRoomError('');
    const { data, error } = await supabase
      .from('karaoke_rooms')
      .insert([{ song: '', lyrics: '', scores: {}, players: [userId] }])
      .select();
    if (error) setRoomError(error.message);
    else if (data && data[0]) setRoomId(data[0].id);
  };

  const joinRoom = async (id: string) => {
    setRoomError('');
    setRoomId(id);
    // Add user to room (fetch current, append, update)
    const { data: roomData } = await supabase.from('karaoke_rooms').select('players').eq('id', id).single();
    if (roomData) {
      const updatedPlayers = roomData.players.includes(userId) ? roomData.players : [...roomData.players, userId];
      await supabase.from('karaoke_rooms').update({ players: updatedPlayers }).eq('id', id);
    }
  };

  // Listen for room changes
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel('karaoke_room_' + roomId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_rooms' }, payload => {
        const room = payload.new as KaraokeRoom;
        if (room) {
          setLyrics(room.lyrics);
          setScores(room.scores || {});
          setPlayers(room.players || []);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const searchSongs = async () => {
    setSearchLoading(true);
    setError('');
    try {
      const res = await fetch(`https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json`);
      const data = await res.json();
      setSongs(data.recordings || []);
      if (!data.recordings || data.recordings.length === 0) {
        setError('No songs found.');
      }
    } catch (e) {
      setError('Error searching songs.');
    }
    setSearchLoading(false);
  };

  const fetchLyrics = async (artist: string, title: string) => {
    setLyricsLoading(true);
    setLyrics('');
    setError('');
    try {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      const data = await res.json();
      // Multiplayer: update lyrics in room
      if (roomId) {
        await supabase.from('karaoke_rooms').update({ lyrics: data.lyrics || 'Lyrics not found' }).eq('id', roomId);
      }
      setLyrics(data.lyrics || 'Lyrics not found');
      if (!data.lyrics) setError('Lyrics not found.');
    } catch (e) {
      setLyrics('Lyrics not found');
      setError('Error fetching lyrics.');
    }
    setLyricsLoading(false);
  };

  const cleanupAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    scoringRef.current = false;
  };

  const startScoring = () => {
    if (!audioRef.current) return;
    cleanupAudio();
    scoringRef.current = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      analyserRef.current = audioContext.createAnalyser();
      if (analyserRef.current) {
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        const detectPitch = Pitchfinder.YIN();

        let lastPitch: number | null = null;
        const loop = () => {
          if (!scoringRef.current) return;
          if (analyserRef.current) {
            analyserRef.current.getFloatTimeDomainData(dataArray);
            const pitch = detectPitch(dataArray);
            if (pitch) {
              // Score based on pitch stability (less change = higher score)
              if (lastPitch !== null) {
                const diff = Math.abs(pitch - lastPitch);
                setScore(prev => prev + Math.max(0, 10 - Math.floor(diff / 10)));
                // Multiplayer: update score in room
                if (roomId && userId) {
                  supabase.from('karaoke_rooms').update({
                    scores: { ...scores, [userId]: score }
                  }).eq('id', roomId);
                }
              } else {
                setScore(prev => prev + 5);
                if (roomId && userId) {
                  supabase.from('karaoke_rooms').update({
                    scores: { ...scores, [userId]: score }
                  }).eq('id', roomId);
                }
              }
              lastPitch = pitch;
            }
          }
          requestAnimationFrame(loop);
        };
        loop();
      }
    }).catch(() => setError('Microphone access denied.'));
  };

  const stopScoring = () => {
    scoringRef.current = false;
    cleanupAudio();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      {/* Multiplayer UI */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button onClick={createRoom} className="px-4 py-2 bg-green-700 text-white rounded">Create Room</button>
          <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Room ID" className="px-2 py-1 rounded" />
          <button onClick={() => joinRoom(roomId)} className="px-4 py-2 bg-blue-700 text-white rounded">Join Room</button>
        </div>
        {roomError && <div className="text-red-400">{roomError}</div>}
        {roomId && <div className="text-green-400">Room: {roomId}</div>}
        {players.length > 0 && <div className="text-white">Players: {players.join(', ')}</div>}
      </div>
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-xl border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">KaraokeLab</h1>
        <div className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a song"
            className="flex-1 px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={searchSongs}
            className="px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
            disabled={searchLoading}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
        <div className="mb-6">
          {songs.map((s: Song) => (
            <button
              key={s.id}
              onClick={() => {
                const title = s.title;
                const artist = s['artist-credit']?.[0]?.name || '';
                fetchLyrics(artist, title);
              }}
              className="block w-full text-left px-4 py-2 mb-2 rounded bg-gray-800 text-white hover:bg-purple-700 transition"
            >
              {s.title} - {s['artist-credit']?.[0]?.name}
            </button>
          ))}
        </div>
        {lyricsLoading && (
          <div className="mb-6 text-purple-400 text-center">Loading lyrics...</div>
        )}
        {lyrics && !lyricsLoading && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-purple-400 mb-2">Lyrics</h2>
            <pre className="bg-gray-800 rounded p-4 text-gray-200 whitespace-pre-wrap max-h-64 overflow-y-auto">{lyrics}</pre>
          </div>
        )}
        <div className="mb-6">
          <input
            type="file"
            accept="audio/*"
            onChange={e => {
              const files = e.target.files;
              if (files && files[0]) {
                setAudioUrl(URL.createObjectURL(files[0]));
                setScore(0);
                stopScoring();
              }
            }}
            className="block w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 mb-2"
          />
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              onPlay={startScoring}
              onPause={stopScoring}
              onEnded={stopScoring}
              className="w-full mt-2"
            />
          )}
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-purple-400">Score: {score}</span>
          {roomId && (
            <div className="mt-2">
              <h3 className="text-purple-300">Multiplayer Scores</h3>
              <ul>
                {Object.entries(scores).map(([uid, sc]) => (
                  <li key={uid} className="text-white">{uid}: {sc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KaraokePage;
// ...existing code...