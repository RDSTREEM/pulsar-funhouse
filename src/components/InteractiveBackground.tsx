"use client";

import React, { useRef, useEffect } from 'react';

const InteractiveBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

  const mouse = { x: width / 2, y: height / 2 };
  let particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  let waveOffset = 0;
  const MAX_PARTICLES = 120;
  let lastParticleTime = 0;

    function addParticle(x: number, y: number) {
      // Only spawn if under max and cooldown passed
      const now = Date.now();
      if (particles.length >= MAX_PARTICLES || now - lastParticleTime < 30) return;
      lastParticleTime = now;
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 80 + Math.random() * 60,
      });
    }

    function drawAnimatedBackground() {
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw moving sine wave shapes
      waveOffset += 0.02;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y = Math.sin((x / 120) + waveOffset) * 32 + height / 2 + Math.cos(waveOffset * 2) * 24;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = '#3a3a6e';
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      drawAnimatedBackground();
      particles.forEach((p, i) => {
        // Fizz effect: random jitter
        p.x += p.vx + (Math.random() - 0.5) * 1.5;
        p.y += p.vy + (Math.random() - 0.5) * 1.5;
        p.life--;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 3); // Slightly smaller particles
        // Blend color with background gradient
        ctx.fillStyle = `rgba(60, 70, 120, ${Math.max(0, p.life / 180)})`;
        ctx.shadowColor = '#2a2a4e';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      particles = particles.filter(p => p.life > 0);
      requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      addParticle(mouse.x, mouse.y);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    animate();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
      {children}
    </>
  );
};

export default InteractiveBackground;
