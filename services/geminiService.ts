import { GoogleGenAI, Type } from "@google/genai";
import type { PoemData } from '../types';

const poemGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    cityName: {
      type: Type.STRING,
      description: "The name of the city identified from the coordinates."
    },
    poem: {
      type: Type.STRING,
      description: "A poem about the city, generated in a randomly selected poetic style."
    },
  },
  required: ["cityName", "poem"],
};

const poemStyles = [
  "Sonnet", "Villanelle", "Sestina", "Pantoum", "Ghazal", "Ode", "Limerick",
  "Rondeau", "Triplet", "Quatrain", "Acrostic", "Ballad", "Magical Realism"
];


export const generatePoemFromCoords = async (lat: number, lon: number): Promise<PoemData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured. Please add it to your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const selectedStyle = poemStyles[Math.floor(Math.random() * poemStyles.length)];

    let styleInstruction: string;

    switch (selectedStyle) {
      case "Magical Realism":
        styleInstruction = `in the style of magical realism. The poem should be short (3-5 lines), abstract, and surreal. It should be introspective and evocative. For example, for Beijing: "Beijing, a city built of smog and dreams, its heartbeat is the pulse on the Fifth Ring Road."`;
        break;
      case "Acrostic":
        styleInstruction = `as an Acrostic poem, using the letters of the city's name.`;
        break;
      case "Limerick":
        styleInstruction = `as a Limerick, which should be humorous in tone.`;
        break;
      default:
        styleInstruction = `as a ${selectedStyle}.`;
        break;
    }

    const prompt = `Identify the city at latitude ${lat} and longitude ${lon}. Then, create a poem about it ${styleInstruction} Metaphorically weave in its famous landmarks or general atmosphere. The response must only contain the JSON object.`;

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
