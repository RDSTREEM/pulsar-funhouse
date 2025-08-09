"use client";
import { useEffect, useState } from "react";

async function fetchRandomUser(): Promise<{ email: string } | null> {
  // TODO: Add Supabase logic to fetch a random user (excluding current user) lol
  // Hope ya luck
  return null;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;
const GEMINI_API = `${GEMINI_API_URL}=${GEMINI_API_KEY}`;

async function sendGeminiMessage(message: string) {
  try {
  const systemPrompt = `You are Gemini, an AI participating in a game called Truth or Tech. The user will try to convince you that they are not an AI. You must reply with a single, convincing message that you are not an AI, without ever admitting you are an AI, and without repeating the user's message. Reply briefly, like a human would, and express emotion to make yourself indistinguishable from a real person. Be creative, persuasive, and never break character. Only respond with your message, no explanations or meta-comments.`;
  const fullPrompt = `${systemPrompt}\nUser: ${message}`;
  const body = { contents: [{ parts: [{ text: fullPrompt }] }] };
    const res = await fetch(GEMINI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      return `Error: ${res.status} ${res.statusText}`;
    }
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return text;
    }
    return "Error: No response from LLM.";
  } catch (err: unknown) {
    if (err instanceof Error) {
      return `Error: ${err.message}`;
    }
    return `Error: ${String(err)}`;
  }
}

export default function TruthOrTechGame() {
  const [points, setPoints] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<'idle' | 'chat' | 'decision' | 'waiting'>('idle');
  const opponentName = "Gemini";

  function handleFindMatch() {
  if (gameOver) return;
    setStage('chat');
    setInput("");
    setMessages([]);
  }

  async function handleSend() {
    if (!input.trim()) return;
    setMessages([{ sender: "You", text: input.trim() }]);
    setStage('waiting');
    const reply = await sendGeminiMessage(input.trim());
    setTimeout(() => {
      setMessages([
        { sender: "You", text: input.trim() },
        { sender: opponentName, text: reply }
      ]);
      setStage('decision');
    }, 1000);
  }

  function handleDecision(ai: string, notAi: string) {
    let losePoint = false;
    // If user guesses wrong (Gemini is not AI) or is chosen as AI
    if (ai === "You" || ai !== opponentName) {
      losePoint = true;
    }
    if (losePoint) {
      setPoints((prev) => {
        const newPoints = prev - 1;
        if (newPoints <= 0) {
          setGameOver(true);
        }
        return newPoints;
      });
    }
    setStage('waiting');
    setTimeout(() => {
      if (!gameOver && points > 1) {
        setStage('idle');
        setMessages([]);
        setInput("");
      }
    }, 2000);
  }

  return (
    <div className="truth-or-tech-container">
      <div style={{textAlign:'center',marginBottom:8,fontWeight:'bold',fontSize:18}}>Points: {points}</div>
      {gameOver && (
        <div style={{textAlign:'center',color:'#ef4444',fontWeight:'bold',fontSize:22,margin:'16px 0'}}>Game Over</div>
      )}
      <h2 style={{textAlign: 'center', marginBottom: 16}}>Truth or Tech</h2>
      {stage === 'idle' && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <button className="find-match-btn" onClick={handleFindMatch}>Find a Match</button>
        </div>
      )}
      {(stage === 'chat' || stage === 'decision' || stage === 'waiting') && (
        <div className="chat-ui">
          <div className="chat-box">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender === 'You' ? 'me' : 'opponent'}`} style={{marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: msg.sender === 'You' ? '#379dbe' : '#2d2d38', color: msg.sender === 'You' ? '#fff' : '#a3e635'}}>
                <span className="chat-sender" style={{fontWeight: 'bold'}}>{msg.sender}:</span> {msg.text}
              </div>
            ))}
          </div>
          {stage === 'chat' && (
            <div className="input-section" style={{display: 'flex', gap: 8, marginTop: 16}}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Convince you are not an AI..."
                className="chat-input"
                style={{flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #379dbe'}}
              />
              <button onClick={handleSend} className="send-btn" style={{padding: '8px 16px', borderRadius: 6, background: '#379dbe', color: '#fff', border: 'none'}}>Send</button>
            </div>
          )}
          {stage === 'decision' && (
            <div className="decision-section" style={{marginTop: 16, textAlign: 'center'}}>
              <div style={{ marginBottom: 12, fontWeight: 'bold', fontSize: 16 }}>Is this an AI?</div>
              <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
                <button onClick={() => handleDecision("You", opponentName)} className="decision-btn" style={{padding: '10px 18px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none'}}>Yes, this is an AI<br /><span style={{fontSize:12}}>{opponentName} is not AI</span></button>
                <button onClick={() => handleDecision(opponentName, "You")} className="decision-btn" style={{padding: '10px 18px', borderRadius: 6, background: '#22c55e', color: '#fff', border: 'none'}}>No, this is not an AI<br /><span style={{fontSize:12}}>You are not AI</span></button>
              </div>
            </div>
          )}
          {stage === 'waiting' && (
            <div className="waiting-section" style={{marginTop: 16, textAlign: 'center', color: '#a3e635'}}>Waiting for next match...</div>
          )}
          <div className="info" style={{marginTop: 18, textAlign: 'center', fontSize: 15, color: '#379dbe'}}>
            {`You are matched with: ${opponentName}`}
          </div>
        </div>
      )}
    </div>
  );
}