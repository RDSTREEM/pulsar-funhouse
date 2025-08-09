'use client';
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const GRAVITY = 1.2;
const JUMP_HEIGHT = 10;
const PIPE_WIDTH = 60;
const PIPE_GAP = 110;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const backgroundUrl = '/assets/Flappy-Bird-ass/background.png';
const birdUrl = '/assets/Flappy-Bird-ass/flappy_bird.png';

function getRandomPipeY() {
  return Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;
}

const FlappyBird: React.FC = () => { 
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [pipes, setPipes] = useState([{ x: GAME_WIDTH, y: 200 }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const velocity = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPipes([{ x: GAME_WIDTH, y: getRandomPipeY() }]);
    setBirdY(GAME_HEIGHT / 2);
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      velocity.current += GRAVITY;
      setBirdY((y) => Math.max(y + velocity.current, 0));
      setPipes((prev) => {
        const newPipes = prev.map((pipe) => ({ ...pipe, x: pipe.x - 3 }));
        if (newPipes[0].x < -PIPE_WIDTH) {
          newPipes.shift();
          newPipes.push({ x: GAME_WIDTH, y: getRandomPipeY() });
          setScore((s) => s + 1);
        }
        return newPipes;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return;
    const birdBox = {
      x: 60,
      y: birdY,
      w: BIRD_WIDTH,
      h: BIRD_HEIGHT,
    };
    for (const pipe of pipes) {
      if (
        birdBox.x + birdBox.w > pipe.x &&
        birdBox.x < pipe.x + PIPE_WIDTH &&
        (birdBox.y < pipe.y || birdBox.y + birdBox.h > pipe.y + PIPE_GAP)
      ) {
        setGameOver(true);
      }
    }
    if (birdY + BIRD_HEIGHT > GAME_HEIGHT) {
      setGameOver(true);
    }
  }, [birdY, pipes, started, gameOver]);

  const handleJump = () => {
    if (!started) {
      setStarted(true);
      setGameOver(false);
      setBirdY(GAME_HEIGHT / 2);
      setPipes([{ x: GAME_WIDTH, y: getRandomPipeY() }]);
      setScore(0);
      velocity.current = 0;
      return;
    }
    if (!gameOver) {
      velocity.current = -JUMP_HEIGHT;
    }
  };

  return (
    <div
      ref={gameRef}
      className="glass-card mx-auto relative overflow-hidden"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: `url(${backgroundUrl})`,
        borderRadius: 12,
        boxShadow: '0 0 20px #0003',
      }}
      tabIndex={0}
      onClick={handleJump}
      onKeyDown={(e) => {
        if (e.code === 'Space') handleJump();
      }}
    >
      {/* Bird */}
      <Image
        src={birdUrl}
        alt="bird"
        width={BIRD_WIDTH}
        height={BIRD_HEIGHT}
        style={{
          position: 'absolute',
          left: 60,
          top: birdY,
          width: BIRD_WIDTH,
          height: BIRD_HEIGHT,
          zIndex: 2,
        }}
      />
      {/* Pipes */}
      {pipes.map((pipe, idx) => (
        <React.Fragment key={idx}>
          {/* Top pipe */}
          <div
            style={{
              position: 'absolute',
              left: pipe.x,
              top: 0,
              width: PIPE_WIDTH,
              height: pipe.y,
              background: 'linear-gradient(#4ec0ca, #379dbe)',
              borderRadius: 8,
              border: '2px solid #379dbe',
            }}
          />
          {/* Bottom pipe */}
          <div
            style={{
              position: 'absolute',
              left: pipe.x,
              top: pipe.y + PIPE_GAP,
              width: PIPE_WIDTH,
              height: GAME_HEIGHT - (pipe.y + PIPE_GAP),
              background: 'linear-gradient(#4ec0ca, #379dbe)',
              borderRadius: 8,
              border: '2px solid #379dbe',
            }}
          />
        </React.Fragment>
      ))}
      {/* Score & Game Over */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontSize: 32,
          color: '#fff',
          textShadow: '2px 2px 8px #000',
          fontWeight: 'bold',
        }}
      >
        {score}
      </div>
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: GAME_HEIGHT / 2 - 60,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontSize: 36,
            color: '#ff4444',
            textShadow: '2px 2px 8px #000',
            fontWeight: 'bold',
            background: 'rgba(0,0,0,0.3)',
            padding: 20,
            borderRadius: 12,
          }}
        >
          Game Over<br />
          <span style={{ fontSize: 20, color: '#fff' }}>Click or press Space to restart</span>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;