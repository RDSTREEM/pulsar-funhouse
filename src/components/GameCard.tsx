import React from "react";
import Link from "next/link";
import Image from "next/image";

interface GameCardProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  badge?: string;
  loggedIn?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ name, description, url, image, badge, loggedIn }) => {
  return (
    <div className="glass-card w-80 h-96 group overflow-hidden animate-[fadeIn_1.2s] relative flex flex-col justify-between p-6">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 z-0 pointer-events-none">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-blue-400 blur-xl opacity-60 animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400 blur-xl opacity-60 animate-pulse" />
      </div>
      <div className="relative z-10">
        {image ? (
          <Image
            src={image}
            alt={name}
            className="w-full h-32 object-cover rounded-xl mb-4 border-2 border-pink-400/30 shadow-lg animate-[wiggle_1.5s_ease-in-out_infinite]"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-gray-800 via-purple-900 to-pink-900 rounded-xl mb-4 flex items-center justify-center text-gray-600 animate-pulse">
            No Image
          </div>
        )}
        <h2 className="gradient-title text-2xl mb-2 animate-[tada_1.2s]">{name}</h2>
        <p className="text-gray-300 mb-4 text-base animate-[fadeIn_1.2s]">{description}</p>
        {badge && (
          <div className="absolute top-4 right-4 group z-20">
            <span className="glass-badge animate-pulse cursor-pointer">{badge}</span>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-900 text-xs rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-gray-700"
                 style={{ color: loggedIn ? '#22c55e' : '#ef4444' }}>
              {loggedIn ? 'Game requires log in' : 'Game requires log in'}
            </div>
          </div>
        )}
      </div>
      <Link href={url}>
        <span className="gradient-btn mt-auto inline-block text-center animate-[bounce_1.2s_infinite]">Play</span>
      </Link>
    </div>
  );
};

export default GameCard;
