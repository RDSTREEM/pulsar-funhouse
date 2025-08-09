"use client";

import React, { useEffect, useRef, useState } from "react";

const ROAD_WIDTH = 400;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const OBSTACLE_WIDTH = 32;
const OBSTACLE_HEIGHT = 32;
const ROAD_HEIGHT = 500;
const OBSTACLE_SPEED = 4;
const OBSTACLE_INTERVAL = 900;

// 4 lanes: 0,1 for left car; 2,3 for right car
const lanePositions = [ROAD_WIDTH / 8 - CAR_WIDTH / 2, (3 * ROAD_WIDTH) / 8 - CAR_WIDTH / 2, (5 * ROAD_WIDTH) / 8 - CAR_WIDTH / 2, (7 * ROAD_WIDTH) / 8 - CAR_WIDTH / 2];
const initialCarLanes = [0, 2]; // left car starts in lane 0, right car in lane 2

type Obstacle = { lane: number; y: number; id: number; type: "circle" | "square" };

function getRandomObstacle(carIdx: number): Obstacle {
	// carIdx: 0 for left, 1 for right
	const lane = carIdx === 0 ? (Math.random() < 0.5 ? 0 : 1) : (Math.random() < 0.5 ? 2 : 3);
	const type: "circle" | "square" = Math.random() < 0.5 ? "circle" : "square";
	return { lane, y: -OBSTACLE_HEIGHT, id: Math.random(), type };
}


export default function TwoCarsGame() {
	// carLanes: [leftCarLane, rightCarLane] (values: 0/1 for left, 2/3 for right)
	const [carLanes, setCarLanes] = useState(initialCarLanes);
	type Obstacle = { lane: number; y: number; id: number; type: "circle" | "square" };
	const [obstacles, setObstacles] = useState<Obstacle[]>([]);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const gameRef = useRef(null);

	// Handle key presses
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (gameOver) return;
			// Left car: A/D
			if (e.key === "a" || e.key === "A") {
				setCarLanes(([l, r]) => [l === 0 ? 1 : 0, r]);
			} else if (e.key === "d" || e.key === "D") {
				setCarLanes(([l, r]) => [l === 0 ? 1 : 0, r]);
			}
			// Right car: J/L
			else if (e.key === "j" || e.key === "J") {
				setCarLanes(([l, r]) => [l, r === 2 ? 3 : 2]);
			} else if (e.key === "l" || e.key === "L") {
				setCarLanes(([l, r]) => [l, r === 2 ? 3 : 2]);
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [gameOver]);

	// Spawn obstacles
	useEffect(() => {
		if (gameOver) return;
		const interval = setInterval(() => {
			setObstacles((obs) => [
				...obs,
				getRandomObstacle(0),
				getRandomObstacle(1),
			]);
		}, OBSTACLE_INTERVAL);
		return () => clearInterval(interval);
	}, [gameOver]);

	// Move obstacles and check collisions
	useEffect(() => {
		if (gameOver) return;
		const frame = setInterval(() => {
			setObstacles((obs) => {
				const newObs = obs.map((o) => ({ ...o, y: o.y + OBSTACLE_SPEED }));
				let collision = false;
				let collected = 0;
				newObs.forEach((o) => {
					// Check collision with left car
					if ((o.lane === carLanes[0] || o.lane === carLanes[1]) && o.y + OBSTACLE_HEIGHT > ROAD_HEIGHT - CAR_HEIGHT - 10) {
						// If car is in same lane and at same y
						if (o.type === "square") collision = true;
						else if (o.type === "circle") collected++;
					}
				});
				if (collision) setGameOver(true);
				setScore((s) => s + collected);
				// Remove obstacles that are out of screen or collected
				return newObs.filter((o) => o.y <= ROAD_HEIGHT && !(o.type === "circle" && (o.lane === carLanes[0] || o.lane === carLanes[1]) && o.y + OBSTACLE_HEIGHT > ROAD_HEIGHT - CAR_HEIGHT - 10));
			});
		}, 20);
		return () => clearInterval(frame);
	}, [carLanes, gameOver]);

	function restart() {
		setCarLanes(initialCarLanes);
		setObstacles([]);
		setScore(0);
		setGameOver(false);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
			<h2>Two Cars Game</h2>
			<div style={{ position: "relative", width: ROAD_WIDTH, height: ROAD_HEIGHT, background: "#222", borderRadius: 16, overflow: "hidden" }} ref={gameRef}>
				{/* Lanes */}
				{[1, 2, 3].map((i) => (
					<div key={i} style={{ position: "absolute", left: (i * ROAD_WIDTH) / 4 - 2, top: 0, width: 4, height: ROAD_HEIGHT, background: "#555" }} />
				))}
				{/* Cars */}
				<div style={{ position: "absolute", left: lanePositions[carLanes[0]], top: ROAD_HEIGHT - CAR_HEIGHT - 10, width: CAR_WIDTH, height: CAR_HEIGHT, background: "#e74c3c", borderRadius: 8, border: "2px solid #fff" }} />
				<div style={{ position: "absolute", left: lanePositions[carLanes[1]], top: ROAD_HEIGHT - CAR_HEIGHT - 10, width: CAR_WIDTH, height: CAR_HEIGHT, background: "#3498db", borderRadius: 8, border: "2px solid #fff" }} />
				{/* Obstacles */}
				{obstacles.map((o) => (
					o.type === "circle" ? (
						<div
							key={o.id}
							style={{
								position: "absolute",
								left: lanePositions[o.lane] + (CAR_WIDTH - OBSTACLE_WIDTH) / 2,
								top: o.y,
								width: OBSTACLE_WIDTH,
								height: OBSTACLE_HEIGHT,
								background: "#2ecc40",
								borderRadius: "50%",
								border: "2px solid #fff",
							}}
						/>
					) : (
						<div
							key={o.id}
							style={{
								position: "absolute",
								left: lanePositions[o.lane] + (CAR_WIDTH - OBSTACLE_WIDTH) / 2,
								top: o.y,
								width: OBSTACLE_WIDTH,
								height: OBSTACLE_HEIGHT,
								background: "#f1c40f",
								borderRadius: 6,
								border: "2px solid #fff",
							}}
						/>
					)
				))}
			</div>
			<div style={{ marginTop: 16, fontSize: 18 }}>Score: {score}</div>
			{gameOver && (
				<div style={{ marginTop: 16 }}>
					<div style={{ color: "#e74c3c", fontWeight: "bold" }}>Game Over!</div>
					<button onClick={restart} style={{ marginTop: 8, padding: "8px 16px", fontSize: 16 }}>Restart</button>
				</div>
			)}
			<div style={{ marginTop: 16, color: "#888" }}>
				Controls: <b>A/D</b> (left car), <b>J/L</b> (right car)<br />Collect <span style={{ color: '#2ecc40' }}>●</span> and avoid <span style={{ color: '#f1c40f' }}>■</span>
			</div>
		</div>
	);
}
