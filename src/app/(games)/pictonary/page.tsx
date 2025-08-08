
"use client";

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';


const WORDS = ['apple', 'car', 'house', 'dog', 'tree', 'cat'];

type User = {
  id: string;
  email?: string;
};

type Room = {
  id: string;
  host_user_id: string;
  current_drawer_user_id?: string | null;
  current_word?: string;
  status?: string;
};

type Player = {
  id: string;
  user_id: string;
  username: string;
  is_host?: boolean;
  score?: number;
};

type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
};

type DrawingAction = {
  type: string;
  points: { x: number; y: number }[];
  color: string;
  lineWidth?: number;
};


export default function Pictionary() {
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [drawingActions, setDrawingActions] = useState<DrawingAction[]>([]);
  const [isDrawingTurn, setIsDrawingTurn] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [guess, setGuess] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email });
      } else {
        setUser(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);


  useEffect(() => {
    if (!room) return;

    // Subscribe to drawing_actions
    subscriptionRef.current = supabase
      .channel(`public:drawing_actions:room_id=eq.${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drawing_actions', filter: `room_id=eq.${room.id}` }, (payload) => {
        setDrawingActions((prev) => [...prev, payload.new.action]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drawing_chat', filter: `room_id=eq.${room.id}` }, (payload) => {
        const msg = payload.new as ChatMessage;
        setChatMessages((prev) => [...prev, msg]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drawing_rooms', filter: `id=eq.${room.id}` }, (payload) => {
        const newRoom = payload.new as Room;
        setRoom((r) => ({ ...r!, ...newRoom }));
        setIsDrawingTurn(newRoom.current_drawer_user_id === user?.id);
        setCurrentWord(newRoom.current_drawer_user_id === user?.id ? newRoom.current_word || '' : '');
      })
      .subscribe();

    loadPlayers();
    loadChat();
    loadDrawingActions();

    return () => {
      if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
    };
  }, [room, user]);


  async function loadPlayers() {
    if (!room) return;
    const { data } = await supabase.from('drawing_players').select().eq('room_id', room.id);
    setPlayers(data || []);
  }

  async function loadChat() {
    if (!room) return;
    const { data } = await supabase.from('drawing_chat').select().eq('room_id', room.id).order('created_at');
    setChatMessages(data || []);
  }

  async function loadDrawingActions() {
    if (!room) return;
    const { data } = await supabase.from('drawing_actions').select().eq('room_id', room.id).order('created_at');
    setDrawingActions((data || []).map((d: any) => d.action));
  }

  // Create a room

  async function createRoom() {
    if (!user) return;
    const { data: roomData, error } = await supabase.from('drawing_rooms').insert([{ host_user_id: user.id }]).select().single();
    if (error || !roomData) {
      alert(error?.message || 'Room creation failed');
      return;
    }

    await supabase.from('drawing_players').insert([{ room_id: roomData.id, user_id: user.id, username: user.email || user.id, is_host: true }]);

    setRoom(roomData);
  }

  // Join a room by ID prompt

  async function joinRoom() {
    const roomId = prompt('Enter Room ID to join:');
    if (!roomId || !user) return;

    const { data: roomData, error } = await supabase.from('drawing_rooms').select().eq('id', roomId).single();
    if (error || !roomData) {
      alert('Room not found');
      return;
    }

    const { error: joinError } = await supabase.from('drawing_players').insert([{ room_id: roomId, user_id: user.id, username: user.email || user.id }]);
    if (joinError) {
      alert(joinError.message);
      return;
    }

    setRoom(roomData);
  }

  // Start drawing turn (host only)

  async function startTurn() {
    if (!room || !user) return;
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    await supabase.from('drawing_rooms').update({ current_drawer_user_id: user.id, current_word: randomWord, status: 'playing' }).eq('id', room.id);
  }

  // Drawing handlers

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctxRef.current = ctx;

    redraw();
  }, [drawingActions]);


  function redraw() {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, 600, 400);
    drawingActions.forEach((action) => {
      if (action.type === 'stroke') {
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.lineWidth || 4;
        ctx.beginPath();
        action.points.forEach(({ x, y }, i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    });
  }


  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawingTurn) return;
    drawing.current = true;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentStroke([{ x, y }]);
  }

  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);


  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawingTurn || !drawing.current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentStroke((prev) => [...prev, { x, y }]);
  }


  function handleMouseUp() {
    if (!isDrawingTurn || !drawing.current) return;
    drawing.current = false;
    if (currentStroke.length > 0) {
      sendDrawingAction({
        type: 'stroke',
        points: currentStroke,
        color: '#000',
        lineWidth: 4,
      });
      setCurrentStroke([]);
    }
  }


  async function sendDrawingAction(action: DrawingAction) {
    if (!room || !user) return;
    await supabase.from('drawing_actions').insert([{ room_id: room.id, user_id: user.id, action }]);
  }

  // Chat


  async function sendChatMessage() {
    if (!guess.trim()) return;
    if (!room || !user) return;

    await supabase.from('drawing_chat').insert([{ room_id: room.id, user_id: user.id, message: guess }]);

    // Check if guess is correct
    if (room.current_word && guess.toLowerCase() === room.current_word.toLowerCase()) {
      alert(`${user.email || user.id} guessed the word!`);

      // Update player score
      const player = players.find((p) => p.user_id === user.id);
      if (player) {
        await supabase
          .from('drawing_players')
          .update({ score: (player.score || 0) + 1 })
          .eq('id', player.id);
      }

      // Reset word and current drawer (simple for demo)
      await supabase.from('drawing_rooms').update({ current_word: '', current_drawer_user_id: null, status: 'waiting' }).eq('id', room.id);
    }

    setGuess('');
  }



  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
          <p className="mb-4 text-lg font-semibold text-gray-700">Please sign in to play.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    );


  if (!room)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Pictionary Lobby</h2>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-full transition"
            onClick={createRoom}
          >
            Create Room
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition"
            onClick={joinRoom}
          >
            Join Room by ID
          </button>
        </div>
      </div>
    );



  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-blue-700">Pictionary Room</h2>
        <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <span className="font-semibold text-gray-600">Room ID:</span> <span className="text-gray-800">{room.id}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Status:</span> <span className="text-gray-800">{room.status}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Your Score:</span> <span className="text-green-700 font-bold">{players.find((p) => p.user_id === user.id)?.score || 0}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-600">Players:</span>
          <ul className="flex flex-wrap gap-2 mt-2">
            {players.map((p) => (
              <li key={p.id} className={`px-3 py-1 rounded-full text-sm font-medium ${p.is_host ? 'bg-yellow-200 text-yellow-900' : 'bg-gray-200 text-gray-700'}`}>{p.username}{p.is_host ? ' (Host)' : ''}</li>
            ))}
          </ul>
        </div>

        {room.status === 'waiting' && room.host_user_id === user.id && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 transition"
            onClick={startTurn}
          >
            Start Drawing Turn
          </button>
        )}

        {isDrawingTurn && (
          <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200 text-blue-800 text-lg font-semibold">
            You are drawing: <strong>{currentWord}</strong>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              style={{ border: '2px solid #3b82f6', borderRadius: 12, background: '#f9fafb', cursor: isDrawingTurn ? 'crosshair' : 'not-allowed' }}
              width={600}
              height={400}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="mb-2 shadow-md"
            ></canvas>
            <span className="text-xs text-gray-400">{isDrawingTurn ? 'Draw the word above!' : 'Wait for your turn to draw.'}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-gray-700">Chat</h3>
            <div className="h-40 overflow-y-scroll border border-gray-300 rounded p-2 bg-gray-50 mb-2">
              {chatMessages.length === 0 ? (
                <div className="text-gray-400 text-center">No messages yet.</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-1">
                    <b className="text-blue-700">{players.find((p) => p.user_id === msg.user_id)?.username || 'Unknown'}:</b> <span className="text-gray-800">{msg.message}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                ref={chatInputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendChatMessage();
                }}
                placeholder="Type your guess..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                onClick={sendChatMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
