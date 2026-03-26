import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);
  const [sysTime, setSysTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setSysTime(Date.now()), 137);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-[#00FFFF] font-mono crt-flicker selection:bg-[#FF00FF] selection:text-black overflow-x-hidden tear-effect">
      <div className="static-noise" />
      <div className="scanline" />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b-4 border-[#FF00FF] pb-4 border-dashed">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-[#00FFFF] glitch" data-text="TERMINAL_0x0B">
              TERMINAL_0x0B
            </h1>
            <p className="text-[#FF00FF] text-xl mt-2 tracking-widest font-bold">
              &gt; UPLINK_ESTABLISHED // MEMORY_ADDR: 0x{sysTime.toString(16).toUpperCase()}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col items-end border-2 border-[#00FFFF] p-3 bg-black shadow-[4px_4px_0px_#FF00FF]">
            <span className="text-[#FF00FF] uppercase tracking-widest text-sm font-bold">BYTES_CONSUMED</span>
            <span className="text-5xl font-black text-[#00FFFF] glitch" data-text={score.toString().padStart(8, '0')}>
              {score.toString().padStart(8, '0')}
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col xl:flex-row items-start justify-center gap-8">
          <div className="w-full xl:w-2/3 border-4 border-[#00FFFF] p-1 bg-[#0a0a0a] relative group shadow-[8px_8px_0px_#FF00FF]">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] opacity-30 group-hover:opacity-60 blur-md transition duration-500"></div>
            <div className="relative bg-[#020202] p-4 h-full border border-[#FF00FF]/30">
              <div className="absolute top-0 left-0 bg-[#00FFFF] text-black text-xs px-2 font-bold">PROC: SNAKE.EXE</div>
              <SnakeGame onScoreChange={setScore} />
            </div>
          </div>

          <div className="w-full xl:w-1/3 border-4 border-[#FF00FF] p-1 bg-[#0a0a0a] relative group shadow-[8px_8px_0px_#00FFFF]">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] opacity-30 group-hover:opacity-60 blur-md transition duration-500"></div>
            <div className="relative bg-[#020202] p-4 h-full border border-[#00FFFF]/30">
              <div className="absolute top-0 left-0 bg-[#FF00FF] text-black text-xs px-2 font-bold">PROC: AUDIO_STREAM</div>
              <MusicPlayer />
            </div>
          </div>
        </main>
        
        <footer className="mt-8 border-t-4 border-[#FF00FF] border-dashed pt-4 flex justify-between text-[#00FFFF] text-lg uppercase tracking-widest font-bold">
          <p className="glitch" data-text="CONNECTION_SECURE">CONNECTION_SECURE</p>
          <p>CYCLE: {Math.floor(sysTime / 1000)}</p>
        </footer>
      </div>
    </div>
  );
}
