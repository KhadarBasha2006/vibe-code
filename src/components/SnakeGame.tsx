import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 80;

type Point = { x: number; y: number };

const getBestDirection = (currentSnake: Point[], currentFood: Point, currentDir: Point) => {
  const head = currentSnake[0];
  const possibleMoves = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  const validMoves = possibleMoves.filter(
    m => !(m.x === -currentDir.x && m.y === -currentDir.y)
  );

  const safeMoves = validMoves.filter(m => {
    const nx = head.x + m.x;
    const ny = head.y + m.y;
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
    return true; // Self collision allowed
  });

  if (safeMoves.length === 0) return currentDir;

  safeMoves.sort((a, b) => {
    const distA = Math.abs(head.x + a.x - currentFood.x) + Math.abs(head.y + a.y - currentFood.y);
    const distB = Math.abs(head.x + b.x - currentFood.x) + Math.abs(head.y + b.y - currentFood.y);
    return distA - distB;
  });

  return safeMoves[0];
};

export default function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  
  const directionRef = useRef(direction);
  
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    onScoreChange(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsPaused(false);
  }, [generateFood, onScoreChange]);

  useEffect(() => {
    if (gameOver && isAutoPlay) {
      const timeout = setTimeout(() => resetGame(), 500);
      return () => clearTimeout(timeout);
    }
  }, [gameOver, isAutoPlay, resetGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) {
        if (e.key === 'Enter') resetGame();
        return;
      }
      
      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isAutoPlay) return;

      const { x, y } = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isAutoPlay, resetGame]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      let nextDir = direction;
      
      if (isAutoPlay) {
        nextDir = getBestDirection(snake, food, direction);
        if (nextDir.x !== direction.x || nextDir.y !== direction.y) {
          setDirection(nextDir);
        }
      }

      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + nextDir.x,
          y: head.y + nextDir.y,
        };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 16; // Hexadecimal feeling
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = isAutoPlay ? INITIAL_SPEED * 0.4 : INITIAL_SPEED;
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, isPaused, score, onScoreChange, generateFood, isAutoPlay, snake]);

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <div className="w-full flex justify-between items-center mb-4 border-b-2 border-[#FF00FF] pb-2 border-dashed">
        <span className="text-[#00FFFF] text-xl font-bold">SECTOR: {GRID_SIZE}x{GRID_SIZE}</span>
        <span className={`text-xl font-bold ${isAutoPlay ? 'text-[#FF00FF] animate-pulse glitch' : 'text-[#00FFFF]'}`} data-text={isAutoPlay ? 'AI_OVERRIDE_ACTIVE' : 'MANUAL_CONTROL'}>
          {isAutoPlay ? 'AI_OVERRIDE_ACTIVE' : 'MANUAL_CONTROL'}
        </span>
      </div>

      <div 
        className="relative w-full aspect-square bg-[#050505] border-4 border-[#00FFFF] overflow-hidden shadow-[inset_0_0_50px_rgba(0,255,255,0.2)]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '5% 5%'
        }}
      >
        <div
          className="bg-[#FF00FF] shadow-[0_0_20px_#FF00FF] animate-ping"
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
          }}
        />

        {snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={`${
              index === 0 
                ? 'bg-[#FFFFFF] shadow-[0_0_20px_#FFFFFF] z-10' 
                : 'bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]'
            }`}
            style={{
              gridColumnStart: segment.x + 1,
              gridRowStart: segment.y + 1,
              opacity: 1 - (index * 0.015),
              transform: `scale(${1 - (index * 0.01)})`
            }}
          />
        ))}

        {gameOver && (
          <div className="absolute inset-0 bg-[#020202]/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <h2 className="text-7xl font-black text-[#FF00FF] mb-4 glitch" data-text="SEGFAULT">SEGFAULT</h2>
            <p className="text-[#00FFFF] mb-8 text-2xl font-bold bg-black px-4 py-1 border border-[#00FFFF]">CORE_DUMP_INITIATED</p>
            {!isAutoPlay && (
              <button 
                onClick={resetGame}
                className="px-8 py-4 bg-black border-4 border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-colors text-3xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#00FFFF] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
              >
                [ RESTART_PROC ]
              </button>
            )}
            {isAutoPlay && (
              <p className="text-[#00FFFF] animate-pulse text-2xl font-bold">REBOOTING_IN_SAFE_MODE...</p>
            )}
          </div>
        )}
        
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-[#020202]/80 flex items-center justify-center z-20 backdrop-blur-sm">
            <h2 className="text-6xl font-black text-[#00FFFF] tracking-widest glitch" data-text="THREAD_SUSPENDED">THREAD_SUSPENDED</h2>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-between w-full items-center gap-4">
        <div className="text-[#FF00FF] text-lg font-bold border border-[#FF00FF] p-2 bg-black">
          <p>&gt; MV: W,A,S,D / ARROWS</p>
          <p>&gt; BRK: SPACE</p>
        </div>

        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`px-6 py-3 text-2xl font-black tracking-widest uppercase transition-all border-4 ${
            isAutoPlay 
              ? 'bg-[#FF00FF] border-[#FF00FF] text-black shadow-[4px_4px_0px_#00FFFF] translate-x-[-4px] translate-y-[-4px]' 
              : 'bg-black border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black shadow-[4px_4px_0px_#FF00FF] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
          }`}
        >
          {isAutoPlay ? 'KILL_AI_PROC' : 'EXEC_AI_PROC'}
        </button>
      </div>
    </div>
  );
}
