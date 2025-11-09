import React from 'react';
import type { SwimReport, SwimSegment } from '../types';
import { SwimIcon } from './icons/SwimIcon';

interface HistoryViewProps {
  reports: SwimReport[];
  onSelectReport: (report: SwimReport) => void;
}

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const getStrokeSummary = (segments: SwimSegment[]): string => {
    if (!segments || segments.length === 0) {
        return "Unknown";
    }
    const uniqueStrokes = [...new Set(segments.map(s => s.stroke))];
    if (uniqueStrokes.length === 1) {
        return uniqueStrokes[0];
    }
    return "Mixed Stroke";
}

const HistoryView: React.FC<HistoryViewProps> = ({ reports, onSelectReport }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-zinc-600 animate-fade-in">
        <SwimIcon className="w-10 h-10 mb-2" />
        <p className="font-semibold">No Sessions Yet</p>
        <p className="text-xs">Complete a session to see it here.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-2">
      <ul className="space-y-2">
        {reports.map((report) => (
          <li key={report.swimData.id}>
            <button
              onClick={() => onSelectReport(report)}
              className="w-full text-left p-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center justify-between transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  {new Date(report.swimData.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-zinc-400">
                  {report.swimData.distance}m {getStrokeSummary(report.swimData.segments)}
                </p>
                <p className="text-xs text-cyan-400 mt-1">
                    Pace: {report.metricsAnalysis.pace.value}
                </p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryView;
