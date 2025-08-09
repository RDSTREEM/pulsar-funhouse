"use client";
import React, { useEffect, useState, useRef } from 'react'

type User = {
  id: string;
  email?: string;
};

type GameStatus = 'waiting' | 'active' | 'finished';
type Game = {
  id: string;
  difficulty?: string;
  status?: GameStatus;
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
  const [winner, setWinner] = useState<string | null>(null)
  const WINNING_SCORE = 10;
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting')
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      startNewQuestion()
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
        startNewQuestion()
        setInQueue(false)
      }
    }
  }

  function startNewQuestion() {
    const q = generateMathQuestion(difficulty)
    setQuestion(q)
    setInput('')
  }

  async function submitAnswer() {
    if (!question) return

    if (Math.abs(parseFloat(input) - parseFloat(String(question.answer))) < 0.01) {
      const player = players.find((p) => user && p.user_id === user.id)
      if (!player) return
      const newScore = (player.score || 0) + 1
      await supabase.from('players').update({ score: newScore }).eq('id', player.id)
      if (game) await loadPlayers(game.id)
      setScore(newScore)
      // Check for win condition
      if (newScore >= WINNING_SCORE) {
        setWinner(player.username);
        setGameStatus('finished');
        if (game) {
          await supabase.from('games').update({ status: 'finished' }).eq('id', game.id);
        }
      } else {
        if (game) startNewQuestion();
      }
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
          if (payload.new && payload.new.status && ['waiting','active','finished'].includes(payload.new.status)) {
            setGameStatus(payload.new.status as GameStatus);
          }
        }
      )
      .subscribe()

    return () => cleanupSubscriptions()
  }, [game])

  if (loading) return (
    <div className="glass-main flex items-center justify-center">
      <p className="text-gray-300">Loading...</p>
    </div>
  )

  if (!user)
    return (
      <div className="glass-main flex flex-col items-center justify-center">
        <h1 className="gradient-title text-4xl mb-6">Quick Math Duel</h1>
        <p className="text-lg text-gray-300">You must be logged in to play.</p>
      </div>
    )

  if (!game) {
    return (
      <div className="glass-main flex flex-col items-center justify-center p-8">
        <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
          <h1 className="gradient-title text-3xl mb-6">Welcome <span className="text-blue-400">{user.email || user.id}</span></h1>
          <label className="text-lg mb-4">
            Select Difficulty:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="ml-2 glass-input">
              <option value="easy">Easy (+, -)</option>
              <option value="medium">Medium (+, -, *)</option>
              <option value="hard">Hard (+, -, *, /)</option>
            </select>
          </label>
          {inQueue ? (
            <button
              className="gradient-btn mb-2 px-6 py-2"
              onClick={async () => {
                if (user) {
                  await supabase.from('matchmaking_queue').delete().eq('user_id', user.id)
                  setInQueue(false)
                }
              }}
            >
              Cancel
            </button>
          ) : (
            <button
              className="gradient-btn mb-2 px-8 py-3"
              onClick={enterQueue}
            >
              Find Match
            </button>
          )}
          <button
            className="glass-input mt-6 px-6 py-2 text-lg font-bold text-white bg-gray-800 border-none"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-main flex flex-col items-center justify-center p-8">
      <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
        <h1 className="gradient-title text-3xl mb-2">Game ID: <span className="text-blue-400">{game.id}</span></h1>
        <h2 className="text-lg mb-4">Status: <span className={gameStatus === 'active' ? 'text-blue-400' : 'text-gray-200'}>{gameStatus}</span></h2>
        <h3 className="text-lg mb-2 font-bold">Players:</h3>
        <ul className="list-none mb-4 w-full max-w-md">
          {players.map((p) => (
            <li key={p.id} className="glass-section flex justify-between items-center mb-2 px-4 py-2 text-lg">
              <span className={p.user_id === user.id ? 'text-blue-400 font-bold' : 'text-gray-200'}>{p.username}</span>
              <span>Score: <span className="text-blue-400 font-bold">{p.score}</span> {user && p.user_id === user.id ? <span className="text-blue-400">(You)</span> : ''}</span>
            </li>
          ))}
        </ul>
  {gameStatus === 'active' && question && !winner && (
          <div className="glass-section flex flex-col items-center mt-4 p-6 w-full max-w-md">
            <h3 className="gradient-title text-xl mb-4">Question:</h3>
            <div className="text-2xl font-bold text-blue-400 mb-4">{question.question}</div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              autoFocus
              className="glass-input mb-4 w-full"
            />
            <button
              className="gradient-btn mb-2 px-6 py-2"
              onClick={submitAnswer}
            >
              Submit Answer
            </button>
            <h4 className="text-lg mt-2 text-gray-200">Your Score: <span className="text-blue-400 font-bold">{score}</span></h4>
            <button
              className="glass-input mt-4 px-6 py-2 text-lg font-bold text-white bg-gray-800 border-none"
              onClick={async () => {
                if (user && game) {
                  await supabase.from('players').delete().eq('user_id', user.id).eq('game_id', game.id)
                  setGame(null)
                  setPlayers([])
                  setQuestion(null)
                  setInput('')
                  setScore(0)
                  setGameStatus('waiting')
                  setWinner(null)
                }
              }}
            >
              Leave Game
            </button>
  {/* @ts-ignore */}
  {gameStatus === 'finished' && winner && (
          <div className="glass-section flex flex-col items-center mt-4 p-6 w-full max-w-md">
            <h3 className="gradient-title text-xl mb-4">Game Over!</h3>
            <div className="text-2xl font-bold text-blue-400 mb-4">Winner: {winner}</div>
            <button
              className="gradient-btn mb-2 px-6 py-2"
              onClick={() => {
                setGame(null);
                setPlayers([]);
                setQuestion(null);
                setInput('');
                setScore(0);
                setGameStatus('waiting');
                setWinner(null);
              }}
            >
              Play Again
            </button>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  )
}
