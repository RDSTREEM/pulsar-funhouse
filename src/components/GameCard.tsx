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
    <div className="bg-gray-900 rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200 w-72 h-80 border border-gray-800 relative">
      <div>
        {image ? (
          <Image
            src={image}
            alt={name}
            className="w-full h-32 object-cover rounded mb-4"
          />
        ) : (
          <div className="w-full h-32 bg-gray-800 rounded mb-4 flex items-center justify-center text-gray-600">
            No Image
          </div>
        )}
        <h2 className="text-xl font-bold mb-2 text-white">{name}</h2>
        <p className="text-gray-400 mb-4">{description}</p>
        {badge && (
          <div className="absolute top-4 right-4 group">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${loggedIn ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}
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
        <span className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200">
          Play
        </span>
      </Link>
    </div>
  );
};

export default GameCard;
