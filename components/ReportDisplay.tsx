import React from 'react';
import type { SwimReport } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface ReportDisplayProps {
  report: SwimReport | null;
  isLoading: boolean;
  error: string | null;
  onCloseReport: () => void;
}

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const BulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;


const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, isLoading, error, onCloseReport }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 animate-fade-in">
          <LoadingSpinner className="w-8 h-8 mb-4" />
          <p className="font-semibold">Analyzing your swim...</p>
          <p className="text-xs text-zinc-500 mt-1">This may take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/50 p-4 rounded-lg animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="font-semibold">Analysis Failed</p>
          <p className="text-xs mt-1 text-red-500">{error}</p>
          <button onClick={onCloseReport} className="mt-4 px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full">Try Again</button>
        </div>
      );
    }
    if (report) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div>
            <p className="text-lg font-semibold text-zinc-200">{report.greeting}</p>
            <p className="text-sm text-zinc-400">{report.summary}</p>
          </div>

          <div className="space-y-2">
            <MetricCard title="Pace" value={report.metricsAnalysis.pace.value} analysis={report.metricsAnalysis.pace.analysis} />
            <MetricCard title="Stroke Rate" value={report.metricsAnalysis.strokeRate.value} analysis={report.metricsAnalysis.strokeRate.analysis} />
            <MetricCard title="Heart Rate" value={report.metricsAnalysis.heartRate.value} analysis={report.metricsAnalysis.heartRate.analysis} />
          </div>
          
          {report.identifiedWeaknesses && report.identifiedWeaknesses.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-zinc-300 mb-2 flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-orange-400" /> Key Weaknesses
              </h3>
              <ul className="space-y-2">
                {report.identifiedWeaknesses.map((item, index) => (
                  <li key={index} className="p-3 bg-zinc-900 border-l-4 border-orange-400 rounded-r-lg">
                    <p className="font-semibold text-zinc-200 text-sm">{item.weakness}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-zinc-300 mb-2 flex items-center gap-2"><BulbIcon className="w-5 h-5 text-yellow-400" /> Improvement Tips</h3>
            <ul className="space-y-2">
              {report.improvementTips.map((item, index) => (
                <li key={index} className="p-3 bg-zinc-900 border-l-4 border-yellow-400 rounded-r-lg">
                  <p className="font-semibold text-zinc-200 text-sm">{item.tip}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-bold text-zinc-300 mb-2 flex items-center gap-2"><TargetIcon className="w-5 h-5 text-cyan-400" /> Recommended Drills</h3>
            <ul className="space-y-2">
              {report.recommendedDrills.map((item, index) => (
                <li key={index} className="p-3 bg-zinc-900 border-l-4 border-cyan-400 rounded-r-lg">
                  <p className="font-semibold text-zinc-200 text-sm">{item.drill}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="p-3 bg-zinc-800 rounded-lg flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-300 font-medium text-sm">{report.closingMotivation}</p>
            </div>
          </div>
          <div className="pt-2">
            <button onClick={onCloseReport} className="w-full text-center py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-semibold rounded-full text-sm transition-colors">Done</button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-zinc-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <p className="font-semibold">No Report</p>
        <p className="text-xs">Your report will appear here after a session.</p>
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {renderContent()}
    </div>
  );
};

const MetricCard: React.FC<{title: string, value: string, analysis: string}> = ({title, value, analysis}) => (
    <div className="bg-zinc-900 p-3 rounded-lg w-full">
        <p className="text-xs font-medium text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-cyan-400">{value}</p>
        <p className="text-xs text-zinc-500 mt-1">{analysis}</p>
    </div>
);

export default ReportDisplay;