'use client';

import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useEffect, useState } from 'react';
import { Share_Tech_Mono } from "next/font/google";
import { GameConfig } from '@/types';
import ClientOnly from '@/components/common/ClientOnly';

interface GameClockProps {
  timeLeft: string;
  gameConfig: GameConfig | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

const shareTechMono = Share_Tech_Mono({weight: '400', subsets: ['latin']});

export default function GameClock({ gameConfig, isOpen, setIsOpen, isMobile }: GameClockProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [animatedMs, setAnimatedMs] = useState(99);

  useEffect(() => {
    // Initialize currentTime on client side only
    setCurrentTime(new Date());
    
    let frameId: number;
    const animate = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Only animate milliseconds if game is active and within time bounds
      if (gameConfig?.isActive && 
          (!gameConfig.hasEndTime || (gameConfig.endTime && now.getTime() < new Date(gameConfig.endTime ?? '').getTime())) &&
          (gameConfig.startTime && now.getTime() >= new Date(gameConfig.startTime ?? '').getTime())) {
        setAnimatedMs(prev => (prev - 1 + 100) % 100);
      }
      
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [gameConfig]);

  const calculateTimeComponents = () => {
    if (!gameConfig || !currentTime) return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, progress: 0 };

    // Check for infinite time (no end time)
    if (!gameConfig.hasEndTime) {
      return { 
        hours: 88,
        minutes: 88,
        seconds: 88,
        milliseconds: animatedMs,
        progress: 0
      };
    }

    const now = currentTime.getTime();
    const start = new Date(gameConfig.startTime ?? '').getTime();
    const end = new Date(gameConfig.endTime ?? '').getTime();
    
    // Calculate progress (0 to 1)
    const totalDuration = end - start;
    const elapsed = now - start;
    const remaining = end - now;
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

    if (now < start) {
      // Countdown to start
      const remainingMs = Math.max(0, start - now);
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      const ms = Math.floor((remainingMs % 1000) / 10);
      return {
        hours,
        minutes,
        seconds,
        milliseconds: ms,
        progress: 0,
      };
    } else if (now > end) {
      // After end
      return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, progress: 1 };
    }

    // During competition
    const remainingMs = Math.max(0, remaining);
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    return {
      hours,
      minutes,
      seconds,
      milliseconds: animatedMs,
      progress
    };
  };

  const { hours, minutes, seconds, milliseconds, progress } = calculateTimeComponents();

  const padNumber = (num: number, length: number = 2) => {
    return num.toString().padStart(length, '0');
  };

  const formatTime = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <ClientOnly fallback={<div className="relative bg-black h-32 flex items-center justify-center text-white">Loading clock...</div>}>
      <div className={`relative bg-black ${!isMobile && 'border'}`}>
      {/* Header - only show if not mobile */}
      {!isMobile && (
        <button
          className="flex items-center justify-between w-full z-20 text-white p-2 relative border-b-2 lg:border-t-2 lg:border-b-0"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <h3 className="text-lg font-semibold">GAMECLOCK</h3>
          {isOpen ? (
            <FaChevronUp className="h-5 w-5 transition-transform" />
          ) : (
            <FaChevronDown className="h-5 w-5 transition-transform" />
          )}
        </button>
      )}

      <div 
        className={`overflow-y-hidden transition-[max-height] duration-300 ease-in-out bg-black ${
          isMobile ? '' : 'absolute bottom-full left-0 right-0 border border-b-0'
        } ${
          isOpen ? (isMobile ? 'max-h-[50vh]' : 'max-h-[27vh]') : 'max-h-0'
        }`}
      >
        <div className={`overflow-y-auto ${isMobile ? 'max-h-[245px] min-h-[245px]' : 'max-h-[245px] min-h-[245px]'}`}>
          <div className="text-center p-6">
            {gameConfig && (
              <div className={`text-white p-4 max-w-xl mx-auto flex flex-col items-center space-y-6 ${shareTechMono.className}`}>
                {/* Top clock display */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <span className="text-4xl tracking-wider text-white/40 absolute top-[1px] left-0">00</span>
                        <span className="text-4xl tracking-wider relative z-10">{padNumber(hours) === "88" || padNumber(hours) === "00" ? "--" : padNumber(hours)}</span>
                      </div>
                      <span className="text-xs uppercase tracking-widest pt-2">Hr</span>
                    </div>
                    <span className="text-4xl pb-6">:</span>
                    <div className="flex flex-col items-">
                      <div className="relative">
                        <span className="text-4xl tracking-wider text-white/40 absolute top-[1px] left-0">00</span>
                        <span className="text-4xl tracking-wider relative z-10">{padNumber(minutes) === "88" || padNumber(minutes) === "00" ? "--" : padNumber(minutes)}</span>
                      </div>
                      <span className="text-xs uppercase tracking-widest pt-2">Min</span>
                    </div>
                    <span className="text-4xl pb-6">:</span>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <span className="text-4xl tracking-wider text-white/40 absolute top-[1px] left-0">00</span>
                        <span className="text-4xl tracking-wider relative z-10">{padNumber(seconds) === "88" || padNumber(seconds) === "00" ? "--" : padNumber(seconds)}</span>
                      </div>
                      <span className="text-xs uppercase tracking-widest pt-2">Sec</span>
                    </div>
                    <span className="text-4xl pb-6">:</span>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <span className="text-4xl tracking-wider text-white/20 absolute top-[1px] left-0">00</span>
                        <span className="text-4xl tracking-wider relative z-10 text-gray-500">{padNumber(milliseconds) === "88" || padNumber(milliseconds) === "00" ? "--" : padNumber(milliseconds)}</span>
                      </div>
                      <span className="text-xs uppercase tracking-widest pt-2">M.Sec</span>
                    </div>
                  </div>
                </div>

                {/* Divider line */}
                <hr className="border-t border-gray-200 w-full" />

                {/* Progress bar area */}
                <div className="w-full flex flex-col items-center space-y-2">
                  {/* Progress bar boxes + vertical dividers */}
                  <div className="w-full grid grid-cols-10 gap-0">
                    {Array.from({ length: 10 }).map((_, i) => {
                      // Calculate how filled this specific segment should be (0 to 1)
                      const segmentProgress = Math.max(0, Math.min(1, (progress * 10) - i));
                      
                      return (
                        <div
                          key={i}
                          className="relative h-6 flex items-center justify-center"
                          style={{
                            borderTop: '1px solid gray',
                            borderBottom: '1px solid gray',
                            borderLeft: 'none',
                            borderRight: 'none',
                          }}
                        >
                          {/* Left border segment */}
                          <>
                            <div className="absolute left-0 top-0 w-px h-1 bg-gray-400"></div>
                            <div className="absolute left-0 bottom-0 w-px h-1 bg-gray-400"></div>
                          </>

                          {/* Right border segment */}
                          <>
                            <div className="absolute right-0 top-0 w-px h-1 bg-gray-400"></div>
                            <div className="absolute right-0 bottom-0 w-px h-1 bg-gray-400"></div>
                          </>

                          {/* Inner rectangle - filled based on progress */}
                          <div 
                            className="border border-white w-5/6 h-1/4 relative overflow-hidden"
                          >
                            {gameConfig.hasEndTime && (
                              <div 
                                className="absolute top-0 left-0 h-full bg-white transition-all duration-100"
                                style={{ width: `${segmentProgress * 100}%` }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* START + END labels */}
                  <div className="w-full flex justify-between items-center text-xs uppercase tracking-widest relative">
                    <span>[{formatTime(gameConfig.startTime)}]</span>
                    {currentTime.getTime() < new Date(gameConfig.startTime ?? '').getTime() && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-yellow-300">[GAME STARTING IN]</span>
                    )}
                    {gameConfig.hasEndTime && gameConfig.endTime && currentTime.getTime() > new Date(gameConfig.endTime ?? '').getTime() && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-red-300">[GAMEOVER]</span>
                    )}
                    <span>[{gameConfig.hasEndTime ? formatTime(gameConfig.endTime) : '∞'}]</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
}