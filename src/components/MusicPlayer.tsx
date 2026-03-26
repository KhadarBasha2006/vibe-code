import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 1,
    title: "ERR_NO_SIGNAL.WAV",
    artist: "SECTOR_7",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "MEMORY_LEAK.MP3",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "BUFFER_OVERFLOW.FLAC",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-[#00FFFF]">
      <div className="border-b-2 border-[#FF00FF] pb-2 mb-4 border-dashed">
        <h2 className="text-3xl font-black text-[#FF00FF] glitch" data-text="AUDIO_SUBSYSTEM">AUDIO_SUBSYSTEM</h2>
        <p className="text-sm font-bold mt-1">FREQ: 44.1kHz // BITRATE: 320kbps</p>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />
      
      <div className="flex-1 flex flex-col justify-center mb-8">
        <div className="bg-[#00FFFF]/5 border-2 border-[#00FFFF] p-4 mb-6 relative shadow-[4px_4px_0px_#FF00FF]">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FF00FF]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FF00FF]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FF00FF]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FF00FF]"></div>
          
          <p className="text-[#FF00FF] text-sm mb-1 font-bold animate-pulse">&gt; CURRENT_STREAM:</p>
          <h3 className={`font-black text-4xl truncate mb-1 ${isPlaying ? 'glitch' : ''}`} data-text={currentTrack.title}>
            {currentTrack.title}
          </h3>
          <p className="text-xl font-bold opacity-80">SRC: {currentTrack.artist}</p>
        </div>
        
        {/* Visualizer */}
        <div className="flex items-end space-x-1 h-20 mb-6 border-b-2 border-[#00FFFF]/30 pb-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 ${isPlaying ? 'bg-[#FF00FF]' : 'bg-[#00FFFF] opacity-30'}`}
              style={{ 
                height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                transition: 'height 0.05s ease'
              }}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1 font-bold">
            <span>SEQ_POS</span>
            <span className="text-[#FF00FF]">{Math.round(progress)}%</span>
          </div>
          <div 
            className="w-full h-6 bg-black border-2 border-[#00FFFF] cursor-pointer relative shadow-[2px_2px_0px_#FF00FF]"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-[#FF00FF] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <button onClick={prevTrack} className="px-4 py-2 border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-all text-2xl font-black shadow-[2px_2px_0px_#FF00FF] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
              [ &lt;&lt; ]
            </button>
            
            <button 
              onClick={togglePlay}
              className="px-8 py-3 border-4 border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-all text-3xl font-black shadow-[4px_4px_0px_#00FFFF] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              {isPlaying ? '[ HALT ]' : '[ EXEC ]'}
            </button>
            
            <button onClick={nextTrack} className="px-4 py-2 border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-all text-2xl font-black shadow-[2px_2px_0px_#FF00FF] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
              [ &gt;&gt; ]
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-2 border-2 border-[#00FFFF]/50 p-3 bg-black">
            <span className="text-lg font-bold text-[#FF00FF]">AMP</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-3 bg-black border-2 border-[#00FFFF] appearance-none cursor-pointer accent-[#FF00FF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
