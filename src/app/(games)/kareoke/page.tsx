'use client';
import { useState, useRef } from 'react';
import Pitchfinder from 'pitchfinder';
type Song = {
  id: string;
  title: string;
  ['artist-credit']?: { name: string }[];
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [score, setScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const searchSongs = async () => {
    const res = await fetch(`https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json`);
    const data = await res.json();
    setSongs(data.recordings || []);
  };

  const fetchLyrics = async (artist: string, title: string) => {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await res.json();
    setLyrics(data.lyrics || 'Lyrics not found');
  };

  const startScoring = () => {
    if (!audioRef.current) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      analyserRef.current = audioContext.createAnalyser();
      if (analyserRef.current) {
        source.connect(analyserRef.current);
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        const detectPitch = Pitchfinder.YIN();

        const loop = () => {
          if (analyserRef.current) {
            analyserRef.current.getFloatTimeDomainData(dataArray);
            const pitch = detectPitch(dataArray);
            if (pitch) {
              setScore(prev => prev + Math.floor(Math.random() * 3));
            }
          }
          requestAnimationFrame(loop);
        };
        loop();
      }
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
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
          >
            Search
          </button>
        </div>

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

        {lyrics && (
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
              className="w-full mt-2"
            />
          )}
        </div>

        <div className="text-center">
          <span className="text-lg font-bold text-purple-400">Score: {score}</span>
        </div>
      </div>
    </div>
  );
}