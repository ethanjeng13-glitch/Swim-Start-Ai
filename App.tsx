import React, { useState, useEffect, useCallback } from 'react';
import type { SwimData, SwimReport, SwimSegment } from './types';
import { generateSwimReport } from './services/geminiService';
import ReportDisplay from './components/ReportDisplay';
import SessionView from './components/SessionView';
import HistoryView from './components/HistoryView';
import { SwimIcon } from './components/icons/SwimIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';

type View = 'session' | 'history';
type SessionState = 'idle' | 'recording' | 'loading';

// More realistic simulation data maps
const STROKE_PACE_MAP = {
    'Freestyle': 110, // 1:50 / 100m
    'Backstroke': 125, // 2:05 / 100m
    'Breaststroke': 140, // 2:20 / 100m
    'Butterfly': 135, // 2:15 / 100m
};

const STROKE_HR_MAP = {
    'Freestyle': [140, 160], // bpm range
    'Backstroke': [130, 150],
    'Breaststroke': [125, 145],
    'Butterfly': [155, 175],
};

const STROKE_STROKERATE_MAP = {
    'Freestyle': [55, 65], // strokes per minute range
    'Backstroke': [50, 60],
    'Breaststroke': [40, 50],
    'Butterfly': [50, 60],
};

const STROKE_FATIGUE_MAP = {
    'Freestyle': 1.0,
    'Backstroke': 1.1,
    'Breaststroke': 0.9,
    'Butterfly': 1.5,
};


// Helper to simulate swim data generation from segments, now with a fatigue model
function simulateSwimData(segments: SwimSegment[]): Omit<SwimData, 'notes' | 'id' | 'date'> {
    const totalDurationInSeconds = segments.reduce((sum, seg) => sum + seg.duration, 0);

    let totalDistance = 0;
    let weightedHeartRateSum = 0;
    let weightedStrokeRateSum = 0;
    let cumulativeFatigue = 0;

    for (const segment of segments) {
        // --- Fatigue Model ---
        // Fatigue increases with duration and stroke intensity.
        // This factor will slightly increase pace time and heart rate as the session progresses.
        const fatigueFactor = 1 + (cumulativeFatigue / (totalDurationInSeconds * 1.5)) * 0.15; // Max 15% effect

        // --- Pace Simulation ---
        const basePace = STROKE_PACE_MAP[segment.stroke];
        const randomVariability = (Math.random() - 0.5) * 10; // +/- 5 seconds
        // Apply fatigue: pace gets slower (seconds increase)
        const pacePer100mSeconds = (basePace + randomVariability) * fatigueFactor;
        const segmentDistance = (segment.duration / pacePer100mSeconds) * 100;
        totalDistance += segmentDistance;

        // --- Heart Rate Simulation ---
        const [minHr, maxHr] = STROKE_HR_MAP[segment.stroke];
        const baseSegmentHr = minHr + Math.random() * (maxHr - minHr);
        // Apply fatigue: heart rate increases for the same perceived effort
        const segmentAvgHr = Math.min(baseSegmentHr * fatigueFactor, 190); // Cap HR
        weightedHeartRateSum += segmentAvgHr * segment.duration;

        // --- Stroke Rate Simulation (can be less affected by fatigue) ---
        const [minSr, maxSr] = STROKE_STROKERATE_MAP[segment.stroke];
        const segmentAvgSr = minSr + Math.random() * (maxSr - minSr);
        weightedStrokeRateSum += segmentAvgSr * segment.duration;
        
        // --- Update cumulative fatigue for the next segment ---
        const strokeFatigueContribution = STROKE_FATIGUE_MAP[segment.stroke];
        cumulativeFatigue += segment.duration * strokeFatigueContribution;
    }

    const distance = Math.round(totalDistance / 25) * 25; // Round to nearest 25m
    const minutes = Math.floor(totalDurationInSeconds / 60);
    const seconds = Math.round(totalDurationInSeconds % 60);
    
    // Calculate weighted averages
    const avgHeartRate = totalDurationInSeconds > 0 ? weightedHeartRateSum / totalDurationInSeconds : 140;
    const strokeRate = totalDurationInSeconds > 0 ? weightedStrokeRateSum / totalDurationInSeconds : 55;

    return {
        distance: String(distance),
        time: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        segments: segments,
        avgHeartRate: String(Math.round(avgHeartRate)),
        strokeRate: String(Math.round(strokeRate)),
    };
}


const App: React.FC = () => {
  const [activeReport, setActiveReport] = useState<SwimReport | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('session');
  const [history, setHistory] = useState<SwimReport[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('swimHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load swim history from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('swimHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save swim history to localStorage", e);
    }
  }, [history]);

  const handleStartSession = useCallback(() => {
    setError(null);
    setActiveReport(null);
    setSessionState('recording');
  }, []);

  const handleStopSession = useCallback(async (segments: SwimSegment[], notes: string) => {
    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
    if (totalDuration < 5) { // Prevent submissions for very short sessions
      setSessionState('idle');
      return;
    }
    setSessionState('loading');
    
    const swimMetrics = simulateSwimData(segments);
    const currentSwimData: SwimData = { 
        ...swimMetrics, 
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        notes 
    };
    const previousSessionsData = history.map(h => h.swimData).slice(0, 3); // Get last 3 sessions for context

    try {
      const generatedReport = await generateSwimReport(currentSwimData, previousSessionsData);
      const fullReport: SwimReport = { ...generatedReport, swimData: currentSwimData };
      setHistory(prev => [fullReport, ...prev]);
      setActiveReport(fullReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setSessionState('idle');
    }
  }, [history]);
  
  const handleViewReport = useCallback((report: SwimReport) => {
      setActiveReport(report);
  }, []);

  const handleCloseReport = useCallback(() => {
      setActiveReport(null);
      setError(null);
  }, []);
  
  const renderMainContent = () => {
      if (view === 'session') {
          return <SessionView sessionState={sessionState} onStart={handleStartSession} onStop={handleStopSession} />;
      }
      if (view === 'history') {
          return <HistoryView reports={history} onSelectReport={handleViewReport} />;
      }
      return null;
  }

  if (activeReport || (sessionState === 'loading' && !activeReport) || error) {
      return (
         <div className="bg-black text-white min-h-full flex flex-col p-4">
             <ReportDisplay 
                report={activeReport} 
                isLoading={sessionState === 'loading'} 
                error={error} 
                onCloseReport={handleCloseReport} 
              />
         </div>
      );
  }

  return (
    <div className="bg-black text-white min-h-full flex flex-col p-4">
      <header className="w-full text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <SwimIcon className="w-6 h-6 text-cyan-400"/>
            <h1 className="text-xl font-bold text-zinc-200">
              SwimSmart
            </h1>
          </div>
      </header>

      <nav className="w-full flex p-0.5 bg-zinc-800 rounded-full mb-4">
        <button 
          onClick={() => setView('session')}
          className={`w-1/2 rounded-full py-1 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${view === 'session' ? 'bg-cyan-500 text-black' : 'text-zinc-300'}`}
        >
          <SwimIcon className="w-4 h-4" />
          Session
        </button>
        <button 
          onClick={() => setView('history')}
          className={`w-1/2 rounded-full py-1 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${view === 'history' ? 'bg-cyan-500 text-black' : 'text-zinc-300'}`}
        >
          <HistoryIcon className="w-4 h-4" />
          History
        </button>
      </nav>
      
      <main className="flex-grow">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;