import React, { useState, useEffect, useMemo } from 'react';
import type { SwimSegment } from '../types';

interface SessionViewProps {
  sessionState: 'idle' | 'recording' | 'loading';
  onStart: () => void;
  onStop: (segments: SwimSegment[], notes: string) => void;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(String(hours).padStart(2, '0'));
  parts.push(String(minutes).padStart(2, '0'));
  parts.push(String(seconds).padStart(2, '0'));
  
  return parts.join(':');
};

const SessionView: React.FC<SessionViewProps> = ({ sessionState, onStart, onStop }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  const [isReviewing, setIsReviewing] = useState(false);
  const [finalSegments, setFinalSegments] = useState<SwimSegment[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let timerId: number;
    if (sessionState === 'recording') {
      const now = Date.now();
      setStartTime(now);
      setCurrentTime(now);
      setIsReviewing(false); // Reset review state on new session

      timerId = window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    } else {
      setStartTime(0);
      setCurrentTime(0);
    }

    return () => {
      window.clearInterval(timerId);
    };
  }, [sessionState]);

  const elapsedTime = useMemo(() => (startTime > 0 ? currentTime - startTime : 0), [startTime, currentTime]);
  
  const handleStop = () => {
    const durationInSeconds = Math.round(elapsedTime / 1000);
    const sessionSegment: SwimSegment = {
        // Default to Freestyle for simulation purposes. UI is simplified.
        stroke: 'Freestyle', 
        duration: durationInSeconds
    };
    setFinalSegments([sessionSegment]);
    setIsReviewing(true);
  };

  const handleFinalizeAndAnalyze = () => {
    onStop(finalSegments, notes);
    setIsReviewing(false); 
    setNotes('');
  };

  if (isReviewing) {
    const totalDuration = finalSegments.reduce((sum, seg) => sum + seg.duration, 0);
    const timeString = formatTime(totalDuration * 1000);

    return (
      <div className="flex flex-col h-full text-center animate-fade-in py-2 justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-200">Session Summary</h2>
          <p className="text-2xl font-mono font-bold text-cyan-400 mt-2">{timeString}</p>
          <p className="text-xs text-zinc-500">Total Time</p>
        </div>
        
        <div className="w-full my-4">
          <label htmlFor="notes" className="block text-sm font-semibold text-zinc-400 mb-1 text-left">How did you feel?</label>
          <textarea 
            id="notes" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            rows={3} 
            placeholder="e.g., Felt strong, shoulder was sore..." 
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm"
          />
        </div>

        <button
          onClick={handleFinalizeAndAnalyze}
          className="w-full px-4 py-3 border border-transparent text-lg font-bold rounded-full shadow-sm text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-500 transition-colors"
        >
          Get AI Analysis
        </button>
      </div>
    );
  }
  
  if (sessionState === 'recording') {
    return (
      <div className="flex flex-col items-center justify-around h-full text-center animate-fade-in py-4">
        <div className="w-full">
            <p className="text-5xl font-mono font-bold text-white tabular-nums z-10">{formatTime(elapsedTime)}</p>
        </div>

        <button
          onClick={handleStop}
          className="w-3/4 px-4 py-3 border border-transparent text-lg font-bold rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 transition-colors"
        >
          Stop & Analyze
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className="flex flex-col items-center justify-center">
        <p className="text-zinc-400 text-center mb-6">Press start to begin your<br/>swimming session.</p>
        <button
          onClick={onStart}
          className="w-40 h-40 flex items-center justify-center border-4 border-green-500 text-3xl font-bold rounded-full shadow-lg text-green-500 bg-green-900/50 hover:bg-green-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-500 transition-all duration-300"
        >
          START
        </button>
      </div>
    </div>
  );
};

export default SessionView;