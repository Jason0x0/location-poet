
import { GoogleGenAI, Type } from "@google/genai";
import type { PoemData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const poemGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    cityName: {
      type: Type.STRING,
      description: "The name of the city identified from the coordinates."
    },
    poem: {
      type: Type.STRING,
      description: "A short, abstract, surrealist poem about the city."
    },
  },
  required: ["cityName", "poem"],
};

export const generatePoemFromCoords = async (lat: number, lon: number): Promise<PoemData> => {
  try {
    const prompt = `Identify the city at latitude ${lat} and longitude ${lon}. Then, create a short (3-5 lines), abstract, and surreal poem about it. Metaphorically weave in its famous landmarks or general atmosphere. The poem should be introspective and evocative, in the style of magical realism. For example, for Beijing: "Beijing, a city built of smog and dreams, its heartbeat is the pulse on the Fifth Ring Road."`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: poemGenerationSchema,
        temperature: 1,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Basic validation to ensure the response matches our expected structure
    if (parsedData.cityName && parsedData.poem) {
      return parsedData as PoemData;
    } else {
      throw new Error("Invalid response structure from API.");
    }

  } catch (error) {
    console.error("Error generating poem:", error);
    throw new Error("Failed to commune with the digital muse. Please try again.");
  }
};
