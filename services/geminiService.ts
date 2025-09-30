import { GoogleGenAI, Type } from "@google/genai";
import { MUSIC_GENRES } from '../constants';
import type { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: "AIzaSyApt39J_XSrVVvTICpPgHtZPSJyjMm-lqI" });

export async function getMusicRecommendationsForVideo(frames: string[]): Promise<AnalysisResult> {
  try {
    const prompt = `Analyze these video frames. Describe the overall mood, setting, and actions in a short paragraph. Based on your analysis, recommend 5 music genres from the following list that would fit well as a soundtrack: [${MUSIC_GENRES.map(g => `'${g}'`).join(', ')}]. Return the result as a JSON object with two keys: 'description' (the paragraph) and 'recommendations' (an array of 5 strings from the provided list).`;

    const imageParts = frames.map(frame => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame,
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, ...imageParts] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "A short paragraph describing the video's mood, setting, and actions."
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "An array of 5 recommended music genres from the provided list."
            }
          },
          required: ["description", "recommendations"],
        },
      },
    });
    
    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    // Validate the result
    if (result && typeof result.description === 'string' && Array.isArray(result.recommendations)) {
      return result as AnalysisResult;
    } else {
      throw new Error("Invalid response format from API.");
    }

  } catch (error) {
    console.error("Error getting music recommendations:", error);
    throw new Error("Failed to get music recommendations from the AI. Please check your API key and try again.");
  }
}