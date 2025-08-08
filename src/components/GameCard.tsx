import React from "react";
import Link from "next/link";
import Image from "next/image";

interface GameCardProps {
  name: string;
  description: string;
  url: string;
  image?: string;
}

const GameCard: React.FC<GameCardProps> = ({ name, description, url, image }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200 w-72 h-80 border border-gray-800">
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
