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
    <Link href={url} className="block w-80 h-96 group">
      <div className="w-full h-full flex flex-col justify-between p-5 rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-lg transition-transform duration-200 hover:scale-105 relative overflow-hidden cursor-pointer">
        {/* Subtle animated gradient border on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 group-hover:animate-gradient-border transition-all duration-300 z-10" />
        {/* Soft gradient overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 opacity-60 z-0" />
        <div className="relative z-20">
          {image ? (
              <div className="relative w-full h-32 mb-3">
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover rounded-lg border border-gray-900"
                />
              </div>
          ) : (
            <div className="w-full h-32 bg-gray-900 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-sm">
              No Image
            </div>
          )}
          <h2 className="text-lg font-semibold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-sm">{name}</h2>
          <p className="text-gray-300 mb-3 text-sm">{description}</p>
          {badge && (
            <div className="absolute top-4 right-4 z-30">
              <span className="bg-blue-900/60 text-blue-200 px-2 py-1 rounded text-xs border border-blue-500 shadow-sm">{badge}</span>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center mt-auto mb-2 z-20">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded px-4 py-2 inline-block text-center text-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">Play</span>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
