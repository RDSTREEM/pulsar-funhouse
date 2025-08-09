"use client";
import React, { useEffect, useRef } from "react";

const MouseTrail: React.FC = () => {
  const NUM_CIRCLES = 10;
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    const positions = Array(NUM_CIRCLES).fill([mouseX, mouseY]);

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);

    function animate() {
      // Move each circle towards the previous one's position
      positions[0] = [mouseX, mouseY];
      for (let i = 1; i < NUM_CIRCLES; i++) {
        const [prevX, prevY] = positions[i - 1];
        const [currX, currY] = positions[i];
        positions[i] = [
          currX + (prevX - currX) * 0.3,
          currY + (prevY - currY) * 0.3,
        ];
      }
      // Update DOM
      for (let i = 0; i < NUM_CIRCLES; i++) {
        const el = circlesRef.current[i];
        if (el) {
          const [x, y] = positions[i];
          el.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      {Array.from({ length: NUM_CIRCLES }).map((_, i) => (
        <div
          key={i}
          ref={el => { circlesRef.current[i] = el; }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 20 - i,
            height: 20 - i,
            borderRadius: "50%",
            background: `hsl(${(i * 36) % 360}, 80%, 60%)`,
            pointerEvents: "none",
            zIndex: 50,
            boxShadow: `0 0 ${20 - i * 1.5}px ${5 - i * 0.5}px hsl(${(i * 36) % 360}, 80%, 60%)`,
            opacity: 0.7 - i * 0.05,
            transition: "background 0.2s",
            mixBlendMode: "screen",
          }}
        />
      ))}
    </>
  );
};

export default MouseTrail;
