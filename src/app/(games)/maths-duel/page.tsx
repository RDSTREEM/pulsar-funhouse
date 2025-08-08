"use client";
import React, { useEffect, useState, useRef } from 'react'

type User = {
  id: string;
  email?: string;
};

type Game = {
  id: string;
  difficulty?: string;
  status?: string;
};

type Player = {
  id: string;
  user_id: string;
  username: string;
  score: number;
  is_host: boolean;
};

type Question = {
  question: string;
  answer: number;
};


import { supabase } from '@/lib/supabase'
import { generateMathQuestion } from "@/lib/utils/mathsGenerator"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [inQueue, setInQueue] = useState<boolean>(false)
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [question, setQuestion] = useState<Question | null>(null)
  const [input, setInput] = useState<string>('')
  const [score, setScore] = useState<number>(0)
  const [gameStatus, setGameStatus] = useState<string>('waiting')
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) cleanupSubscriptions()
    })

    return () => {
      if (listener && typeof listener.subscription?.unsubscribe === 'function') {
        listener.subscription.unsubscribe();
      }
    }
  }, [])

  function cleanupSubscriptions() {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }
  }

  useEffect(() => {
    if (!user) return

    if (inQueue) {
      subscriptionRef.current = supabase
        .channel('public:matchmaking_queue')
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'matchmaking_queue', filter: `user_id=eq.${user.id}` },
          () => setInQueue(false)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'games', filter: `status=eq.active` },
          (payload: { new?: { id?: string } }) => {
            if (payload.new && payload.new.id) {
              checkIfInGame(payload.new.id)
            }
          }
        )
        .subscribe()
    }

    return () => cleanupSubscriptions()
  }, [inQueue, user])

  async function checkIfInGame(gameId: string) {
    if (!user) return;
    const { data: ps } = await supabase
      .from('players')
      .select()
      .eq('game_id', gameId)
      .eq('user_id', user.id)

    if (ps && ps.length > 0) {
      setGame({ id: gameId })
      setGameStatus('active')
      loadPlayers(gameId)
      startNewQuestion(gameId)
    }
  }

  async function loadPlayers(gameId: string) {
    const { data: ps } = await supabase.from('players').select().eq('game_id', gameId)
    setPlayers(ps ?? [])
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setGame(null)
    setPlayers([])
    setQuestion(null)
    setInput('')
    setScore(0)
    setGameStatus('waiting')
    setInQueue(false)
  }

  async function enterQueue() {
    if (!user) return

    const { error } = await supabase.from('matchmaking_queue').insert([
      {
        user_id: user.id,
        username: user.email || user.id,
        difficulty,
      },
    ])

    if (error) {
      alert('Error entering matchmaking queue: ' + error.message)
      return
    }

    setInQueue(true)
    watchMatchmaking()
  }

  async function watchMatchmaking() {
    const { data } = await supabase
      .from('matchmaking_queue')
      .select()
      .eq('difficulty', difficulty)
      .order('created_at')

    if (data && data.length >= 2) {
      const [p1, p2] = data

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert([{ difficulty, status: 'active' }])
        .select()
        .single()

      if (gameError) {
        alert('Error creating game: ' + gameError.message)
        return
      }

      const playersToAdd = [
        {
          game_id: gameData.id,
          user_id: p1.user_id,
          username: p1.username,
          score: 0,
          is_host: true,
        },
        {
          game_id: gameData.id,
          user_id: p2.user_id,
          username: p2.username,
          score: 0,
          is_host: false,
        },
      ]

      const { error: playersError } = await supabase.from('players').insert(playersToAdd)

      if (playersError) {
        alert('Error adding players: ' + playersError.message)
        return
      }

      await supabase.from('matchmaking_queue').delete().in('user_id', [p1.user_id, p2.user_id])

      if (user && (user.id === p1.user_id || user.id === p2.user_id)) {
        setGame(gameData)
        setGameStatus('active')
        loadPlayers(gameData.id)
        startNewQuestion(gameData.id)
        setInQueue(false)
      }
    }
  }

  function startNewQuestion(gameId: string) {
    const q = generateMathQuestion(difficulty)
    setQuestion(q)
    setInput('')
  }

  async function submitAnswer() {
    if (!question) return

    if (Math.abs(parseFloat(input) - parseFloat(String(question.answer))) < 0.01) {
      alert('Correct!')

      const player = players.find((p) => user && p.user_id === user.id)
      if (!player) return

      const newScore = (player.score || 0) + 1
      setScore(newScore)

      await supabase.from('players').update({ score: newScore }).eq('id', player.id)

      if (game) loadPlayers(game.id)

      if (game) startNewQuestion(game.id)
    } else {
      alert('Wrong answer, try again.')
    }

    setInput('')
  }

  useEffect(() => {
    if (!game) return

    cleanupSubscriptions()

    subscriptionRef.current = supabase
      .channel(`public:games:id=eq.${game.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${game.id}` },
        () => {
          if (game) loadPlayers(game.id)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${game.id}` },
        (payload: { new?: { status?: string } }) => {
          if (payload.new && payload.new.status) setGameStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => cleanupSubscriptions()
  }, [game])

  if (loading) return (
    <div style={{ background: '#111', color: '#eee', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading...</p>
    </div>
  )

  if (!user)
    return (
      <div style={{ background: '#111', color: '#eee', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 16 }}>Quick Math Duel</h1>
        <p style={{ fontSize: 18, opacity: 0.7 }}>You must be logged in to play.</p>
      </div>
    )

  if (!game) {
    return (
      <div style={{ background: '#111', color: '#eee', minHeight: '100vh', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Welcome <span style={{ color: '#00eaff' }}>{user.email || user.id}</span></h1>
        <label style={{ fontSize: 18, marginBottom: 16 }}>
          Select Difficulty:
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ marginLeft: 10, background: '#222', color: '#eee', border: '1px solid #333', borderRadius: 6, padding: '4px 12px' }}>
            <option value="easy">Easy (+, -)</option>
            <option value="medium">Medium (+, -, *)</option>
            <option value="hard">Hard (+, -, *, /)</option>
          </select>
        </label>
        {inQueue ? (
          <>
            <p style={{ margin: '16px 0', fontSize: 18 }}>Waiting for opponent...</p>
            <button
              style={{ background: '#222', color: '#00eaff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 8 }}
              onClick={async () => {
                if (user) {
                  await supabase.from('matchmaking_queue').delete().eq('user_id', user.id)
                  setInQueue(false)
                }
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            style={{ background: 'linear-gradient(90deg, #00eaff 0%, #0051ff 100%)', color: '#111', border: 'none', borderRadius: 6, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 8, boxShadow: '0 2px 8px #0006' }}
            onClick={enterQueue}
          >
            Find Match
          </button>
        )}
        <button
          style={{ background: '#222', color: '#eee', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 500, fontSize: 15, cursor: 'pointer', marginTop: 24 }}
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#111', color: '#eee', minHeight: '100vh', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Game ID: <span style={{ color: '#00eaff' }}>{game.id}</span></h1>
      <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Status: <span style={{ color: gameStatus === 'active' ? '#00eaff' : '#eee' }}>{gameStatus}</span></h2>

      <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Players:</h3>
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16, width: '100%', maxWidth: 400 }}>
        {players.map((p) => (
          <li key={p.id} style={{ background: '#222', borderRadius: 6, marginBottom: 8, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}>
            <span style={{ color: p.user_id === user.id ? '#00eaff' : '#eee', fontWeight: p.user_id === user.id ? 700 : 500 }}>{p.username}</span>
            <span>Score: <span style={{ color: '#00eaff', fontWeight: 700 }}>{p.score}</span> {user && p.user_id === user.id ? <span style={{ color: '#00eaff' }}>(You)</span> : ''}</span>
          </li>
        ))}
      </ul>

      {gameStatus === 'active' && question && (
        <div style={{ background: '#222', borderRadius: 8, padding: 24, marginTop: 16, width: '100%', maxWidth: 400, boxShadow: '0 2px 8px #0006', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Question:</h3>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#00eaff', marginBottom: 16 }}>{question.question}</div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
            autoFocus
            style={{ background: '#111', color: '#eee', border: '1px solid #333', borderRadius: 6, padding: '8px 16px', fontSize: 18, marginBottom: 12, width: '100%' }}
          />
          <button
            style={{ background: 'linear-gradient(90deg, #00eaff 0%, #0051ff 100%)', color: '#111', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 8, boxShadow: '0 2px 8px #0006' }}
            onClick={submitAnswer}
          >
            Submit Answer
          </button>

          <h4 style={{ fontWeight: 600, fontSize: 18, marginTop: 12, color: '#eee' }}>Your Score: <span style={{ color: '#00eaff' }}>{score}</span></h4>
          <button
            style={{ background: '#222', color: '#eee', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 500, fontSize: 15, cursor: 'pointer', marginTop: 16 }}
            onClick={async () => {
              if (user && game) {
                await supabase.from('players').delete().eq('user_id', user.id).eq('game_id', game.id)
                setGame(null)
                setPlayers([])
                setQuestion(null)
                setInput('')
                setScore(0)
                setGameStatus('waiting')
              }
            }}
          >
            Leave Game
          </button>
        </div>
      )}
    </div>
  )
}
