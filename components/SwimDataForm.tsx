import React, { useState } from 'react';
import type { SwimData } from '../types';
import { STROKE_TYPES } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface SwimDataFormProps {
  onSubmit: (data: SwimData) => void;
  isLoading: boolean;
}

const SwimDataForm: React.FC<SwimDataFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SwimData>({
    date: new Date().toISOString().split('T')[0],
    distance: '1500',
    time: '30:00',
    stroke: 'Freestyle',
    avgHeartRate: '140',
    strokeRate: '55',
    notes: 'Felt strong at the beginning, but tired towards the end.',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm";
  const labelClass = "block text-sm font-semibold text-zinc-400";

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stroke" className={labelClass}>Primary Stroke</label>
          <select id="stroke" name="stroke" value={formData.stroke} onChange={handleChange} required className={inputClass}>
            {STROKE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="distance" className={labelClass}>Distance (m)</label>
            <input type="number" id="distance" name="distance" value={formData.distance} onChange={handleChange} required placeholder="1500" className={inputClass} />
          </div>
          <div>
            <label htmlFor="time" className={labelClass}>Time (MM:SS)</label>
            <input type="text" id="time" name="time" value={formData.time} onChange={handleChange} required placeholder="30:00" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="avgHeartRate" className={labelClass}>Avg. HR</label>
              <input type="number" id="avgHeartRate" name="avgHeartRate" value={formData.avgHeartRate} onChange={handleChange} required placeholder="140" className={inputClass} />
            </div>
            <div>
              <label htmlFor="strokeRate" className={labelClass}>Stroke Rate</label>
              <input type="number" id="strokeRate" name="strokeRate" value={formData.strokeRate} onChange={handleChange} required placeholder="55" className={inputClass} />
            </div>
        </div>
        
        <div>
          <label htmlFor="notes" className={labelClass}>Session Notes</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="How did you feel?" className={inputClass} />
        </div>
        
        <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-base font-bold rounded-full shadow-sm text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-800 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default SwimDataForm;