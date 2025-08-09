"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import '@/../public/assets/Flappy_bird/static.css'; // For global CSS, import in globals.css

const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const GRAVITY = 2;
const FLAP = -25;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const birdImg = '/assets/Flappy_bird/flappy_bird.png';
const pipeImg = '/assets/Flappy_bird/pipe.png';
const flapSound = '/assets/Flappy_bird/flap.wav';
const pointSound = '/assets/Flappy_bird/point (1).wav';

function playSound(src: string) {
  const audio = new window.Audio(src);
  audio.play();
}

const FlappyBird: React.FC = () => {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([{ x: GAME_WIDTH, height: Math.random() * (GAME_HEIGHT - PIPE_GAP) }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameOver) return;
    const handleFlap = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setVelocity(FLAP);
        playSound(flapSound);
      }
    };
    window.addEventListener('keydown', handleFlap);
    return () => window.removeEventListener('keydown', handleFlap);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setBirdY(prev => Math.max(prev + velocity, 0));
      setVelocity(prev => prev + GRAVITY);
      setPipes(prev => {
  const newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - 4 }));
        if (newPipes[0].x < -PIPE_WIDTH) {
          newPipes.shift();
          newPipes.push({ x: GAME_WIDTH, height: Math.random() * (GAME_HEIGHT - PIPE_GAP) });
          setScore(s => s + 1);
          playSound(pointSound);
        }
        return newPipes;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [velocity, gameOver]);

  useEffect(() => {
    // Collision detection
    if (birdY + BIRD_HEIGHT > GAME_HEIGHT) {
      setGameOver(true);
    }
    pipes.forEach(pipe => {
      if (
        pipe.x < BIRD_WIDTH + 50 &&
        pipe.x + PIPE_WIDTH > 50 &&
        (birdY < pipe.height || birdY + BIRD_HEIGHT > pipe.height + PIPE_GAP)
      ) {
        setGameOver(true);
      }
    });
  }, [birdY, pipes]);

  const handleRestart = () => {
    setBirdY(GAME_HEIGHT / 2);
    setVelocity(0);
    setPipes([{ x: GAME_WIDTH, height: Math.random() * (GAME_HEIGHT - PIPE_GAP) }]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flappy-game" ref={gameRef} style={{ width: GAME_WIDTH, height: GAME_HEIGHT, position: 'relative', overflow: 'hidden', background: '#70c5ce' }}>
      <div style={{ position: 'absolute', left: 50, top: birdY, width: BIRD_WIDTH, height: BIRD_HEIGHT }}>
        <Image src={birdImg} alt="bird" width={BIRD_WIDTH} height={BIRD_HEIGHT} />
      </div>
      {pipes.map((pipe, idx) => (
        <React.Fragment key={idx}>
          <div style={{ position: 'absolute', left: pipe.x, top: 0, width: PIPE_WIDTH, height: pipe.height }}>
            <Image src={pipeImg} alt="pipe-top" width={PIPE_WIDTH} height={pipe.height} />
          </div>
          <div style={{ position: 'absolute', left: pipe.x, top: pipe.height + PIPE_GAP, width: PIPE_WIDTH, height: GAME_HEIGHT - pipe.height - PIPE_GAP }}>
            <Image src={pipeImg} alt="pipe-bottom" width={PIPE_WIDTH} height={GAME_HEIGHT - pipe.height - PIPE_GAP} />
          </div>
        </React.Fragment>
      ))}
      <div className="score" style={{ position: 'absolute', top: 10, left: 10, fontSize: 32, color: '#fff', fontWeight: 'bold' }}>{score}</div>
      {gameOver && (
        <div className="game-over" style={{ position: 'absolute', top: GAME_HEIGHT / 2 - 50, left: GAME_WIDTH / 2 - 100, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: 20, borderRadius: 10 }}>
          <div>Game Over</div>
          <button onClick={handleRestart} style={{ marginTop: 10, padding: '10px 20px', fontSize: 18 }}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;
