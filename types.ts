export interface SwimSegment {
  stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly';
  duration: number; // in seconds
}

export interface SwimData {
  id: string;
  date: string; // ISO string
  distance: string;
  time: string;
  segments: SwimSegment[];
  avgHeartRate: string;
  strokeRate: string;
  notes?: string;
}

export const STROKE_TYPES: Readonly<SwimData['segments'][0]['stroke'][]> = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'];

export interface SwimReport {
  greeting: string;
  summary: string;
  metricsAnalysis: {
    pace: {
      value: string;
      analysis: string;
    };
    strokeRate: {
      value: string;
      analysis: string;
    };
    heartRate: {
      value: string;
      analysis: string;
    };
  };
  identifiedWeaknesses: {
    weakness: string;
    description: string;
  }[];
  improvementTips: {
    tip: string;
    description: string;
  }[];
  recommendedDrills: {
    drill: string;
    description:string;
  }[];
  closingMotivation: string;
  swimData: SwimData; // Link report to the data that generated it
}