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
    <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 flex flex-col justify-between hover:shadow-pink-500/30 transition-shadow duration-200 w-80 h-96 border-2 border-purple-700/40 group overflow-hidden animate-[fadeIn_1.2s]">
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
        <h2 className="text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-[tada_1.2s]">{name}</h2>
        <p className="text-gray-300 mb-4 text-base animate-[fadeIn_1.2s]">{description}</p>
        {badge && (
          <div className="absolute top-4 right-4 group z-20">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-400 text-white shadow border border-yellow-400/40 animate-pulse`}
            >
              {badge}
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-900 text-xs rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-gray-700"
                 style={{ color: loggedIn ? '#22c55e' : '#ef4444' }}>
              {loggedIn ? 'Game requires log in' : 'Game requires log in'}
            </div>
          </div>
        )}
      </div>
      <Link href={url}>
        <span className="mt-auto inline-block px-5 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform text-center animate-[bounce_1.2s_infinite] border-2 border-purple-700/40">
          Play
        </span>
      </Link>
      <style jsx global>{`
        @keyframes tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GameCard;
