import React from "react";
import GameCard from "./GameCard";

interface Game {
  name: string;
  description: string;
  link: string;
  image?: string;
  badge?: string;
  aiPowered?: boolean;
}

interface GameSectionProps {
  title: string;
  games: Game[];
}

const GameSection: React.FC<GameSectionProps> = ({ title, games }) => (
  <section className="mb-12 w-full">
    <h2 className="text-3xl font-bold mb-6 text-left w-full">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full place-items-center">
      {games.map((game) => (
        <div key={game.name} className="relative">
          <GameCard
            name={game.name}
            description={game.description}
            url={game.link}
            image={game.image}
            badge={game.badge}
          />
          {game.aiPowered && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-700/80 text-white text-xs rounded px-2 py-1 z-40 text-center shadow-lg">
              ⚠️ May not work if out of tokens or API quota
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
);

export default GameSection;
