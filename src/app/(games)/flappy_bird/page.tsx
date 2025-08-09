import FlappyBird from './flappy_bird';

export default function FlappyBirdPage() {
  return (
    <div className="glass-main">
      <div className="glass-card w-full max-w-xl mx-auto flex flex-col items-center p-8">
        <h2 className="gradient-title text-4xl mb-6">Flappy Bird</h2>
        <FlappyBird />
      </div>
    </div>
  );
}