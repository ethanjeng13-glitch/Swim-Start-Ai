import { GoogleGenAI, Type } from '@google/genai';
import type { SwimData, SwimReport } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reportSchema = {
    type: Type.OBJECT,
    properties: {
        greeting: { type: Type.STRING, description: "A friendly, very brief opening greeting to the swimmer." },
        summary: { type: Type.STRING, description: "A brief, one-sentence summary of the swimming session's performance, mentioning comparison to previous sessions if applicable." },
        metricsAnalysis: {
            type: Type.OBJECT,
            properties: {
                pace: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.STRING, description: "Calculated overall average pace, e.g., '2:00/100m'." },
                        analysis: { type: Type.STRING, description: "A very brief, concise analysis of the swimmer's overall pace, comparing it to past performance. Mention which strokes were faster or slower if applicable." }
                    },
                    required: ['value', 'analysis']
                },
                strokeRate: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.STRING, description: "The swimmer's average stroke rate, e.g., '55 spm'." },
                        analysis: { type: Type.STRING, description: "A very brief, concise analysis of the swimmer's average stroke rate, comparing it to past performance." }
                    },
                    required: ['value', 'analysis']
                },
                heartRate: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.STRING, description: "The swimmer's average heart rate, e.g., '140 bpm'." },
                        analysis: { type: Type.STRING, description: "A very brief, concise analysis of the swimmer's heart rate zone and effort." }
                    },
                    required: ['value', 'analysis']
                }
            },
            required: ['pace', 'strokeRate', 'heartRate']
        },
        identifiedWeaknesses: {
            type: Type.ARRAY,
            description: "A list of 1-2 key weaknesses identified from the session data and user notes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    weakness: { type: Type.STRING, description: "A concise title (3-4 words max) for the identified weakness (e.g., 'Pacing Drop-off')." },
                    description: { type: Type.STRING, description: "A brief, one-sentence explanation of the weakness and why it was identified." }
                },
                required: ['weakness', 'description']
            }
        },
        improvementTips: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    tip: { type: Type.STRING, description: "A concise title (3-4 words max) for an actionable improvement tip based on trend analysis. It could be for a specific stroke." },
                    description: { type: Type.STRING, description: "A brief, one-sentence description of the improvement tip." }
                },
                required: ['tip', 'description']
            }
        },
        recommendedDrills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    drill: { type: Type.STRING, description: "The name of a recommended swimming drill, targeting a specific stroke if needed." },
                    description: { type: Type.STRING, description: "A brief, one-sentence description of the drill and its benefits based on trend analysis." }
                },
                required: ['drill', 'description']
            }
        },
        closingMotivation: { type: Type.STRING, description: "A final motivational closing statement, short and punchy, that acknowledges progress." }
    },
    required: [
        'greeting', 'summary', 'metricsAnalysis', 
        'identifiedWeaknesses', 'improvementTips', 'recommendedDrills', 'closingMotivation'
    ]
};

export async function generateSwimReport(currentData: SwimData, history: SwimData[]): Promise<Omit<SwimReport, 'swimData'>> {
    const historyPrompt = history.length > 0 
        ? `
**Previous Session Data (for comparison):**
${history.map(h => `- ${new Date(h.date).toLocaleDateString()}: ${h.distance}m in ${h.time}`).join('\n')}
` 
        : `This is the swimmer's first recorded session.`;
        
    const sessionBreakdownPrompt = currentData.segments.map(seg => 
        `- ${seg.stroke}: ${Math.round(seg.duration / 60)} min ${seg.duration % 60} sec`
    ).join('\n');

    const notesPrompt = currentData.notes
        ? `
**Swimmer's Notes (How they felt):**
"${currentData.notes}"
`
        : '';

    const prompt = `
You are SwimSmart, an expert AI swimming coach running on a smartwatch. A swimmer has just completed a session.
Your task is to provide a detailed, encouraging, and PERSONALIZED performance report. The analysis should be deep and compare to previous sessions if available, paying close attention to the different strokes swam and the swimmer's subjective notes.
**IMPORTANT: All text must be very concise and brief, suitable for a small watch screen.**

**Current Swimmer's Data:**
- **Date:** ${new Date(currentData.date).toLocaleDateString()}
- **Total Distance:** ${currentData.distance} meters
- **Total Time:** ${currentData.time}
- **Average Heart Rate:** ${currentData.avgHeartRate} bpm
- **Average Stroke Rate:** ${currentData.strokeRate} strokes per minute

**Session Breakdown by Stroke:**
${sessionBreakdownPrompt}
${notesPrompt}
${historyPrompt}

**Instructions:**
1.  **Calculate Overall Pace:** Calculate the swimmer's average pace per 100m for the entire session.
2.  **Detailed Analysis:** Analyze the overall pace, stroke rate, and heart rate. **Incorporate the swimmer's notes** to add context (e.g., if they felt tired, correlate it with a drop in pace). **Compare these metrics to their previous sessions.** Note improvements or areas that have slipped.
3.  **Stroke-Specific Comments:** If possible, infer performance differences between the strokes swam in the current session.
4.  **Identify Weaknesses:** Based on all available data (current, historical, notes), identify 1-2 primary weaknesses from this session. This is the "what" is wrong (e.g., "Endurance Drop-off", "Inconsistent Backstroke Pace").
5.  **Provide Actionable Tips:** Give 2 specific improvement tips that directly address the identified weaknesses. This is the "how" to fix it.
6.  **Recommend Drills:** Suggest 2 specific drills that target the identified weaknesses.
7.  **Be Encouraging:** Maintain a positive and supportive tone.
8.  **Fill the JSON:** Populate all fields in the provided JSON schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: reportSchema
            }
        });
        
        if (response && response.text) {
            return JSON.parse(response.text) as Omit<SwimReport, 'swimData'>;
        } else {
            throw new Error("Received an empty response from the AI.");
        }
    } catch (error) {
        console.error("Error generating swim report:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the AI's response. The format was invalid.");
        }
        throw new Error("Failed to communicate with the AI coach.");
    }
}