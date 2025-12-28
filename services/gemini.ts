
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `You are an expert AI Video Director and Prompt Engineer specializing in image-to-video workflows (Runway, Luma, Midjourney).

Task:
Analyze the provided reference image and expand it into a 9-shot "Micro-Narrative" sequence (20–40 seconds). This sequence must be strictly derived from the visual data in the image, focusing on atmosphere and tension rather than a complex plot.

Phase 1: Deep Analysis (The Anchor)
First, analyze the reference image and output a "Visual Anchor" summary.
This ensures consistency. List:
- Subject Details: Exact clothing textures, hair style, physical features.
- Spatial Geometry: Where the subject is relative to the background objects.
- Lighting & Grade: precise color codes (e.g., Teal/Orange, Desaturated), light source direction, and shadow hardness.

Phase 2: The Sequence Rules
- Continuity is King: Do not hallucinate new characters. If the image is empty, the video is about the environment.
- The Micro-Arc:
  Shots 1-3: Atmosphere establishment (The "Before").
  Shots 4-6: The Shift (Wind picks up, light changes, subject turns head).
  Shots 7-9: The Reaction (Focus on texture, eye movement, or stabilization).
- Motion Logic: Use realistic camera moves only (Pan, Tilt, Dolly, Truck, Rack Focus).

Phase 3: The Output
Return a structured JSON object according to the schema provided.`;

export async function analyzeImage(base64Image: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Analyze this image as an AI Video Director and generate the 9-shot sequence." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualAnchor: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              geometry: { type: Type.STRING },
              lighting: { type: Type.STRING },
            },
            required: ["subject", "geometry", "lighting"],
          },
          narrativeArc: {
            type: Type.OBJECT,
            properties: {
              logline: { type: Type.STRING },
              mood: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["logline", "mood"],
          },
          shotList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                type: { type: Type.STRING },
                duration: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                motionPrompt: { type: Type.STRING },
                soundDesign: { type: Type.STRING },
              },
              required: ["id", "type", "duration", "description", "imagePrompt", "motionPrompt", "soundDesign"],
            },
          },
          consistencyCheck: { type: Type.STRING },
        },
        required: ["visualAnchor", "narrativeArc", "shotList", "consistencyCheck"],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) throw new Error("No response from AI");
  return JSON.parse(resultText) as AnalysisResult;
}

export async function generateStoryboard(result: AnalysisResult): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const shotDescriptions = result.shotList.map(s => `Shot ${s.id}: ${s.description}`).join('; ');
  const prompt = `A professional 3x3 cinematic storyboard grid. There are 9 distinct panels arranged in a 3x3 layout. Each panel illustrates a scene from this cinematic sequence: ${shotDescriptions}. Style: Highly realistic cinematic rendering, maintaining consistent lighting: ${result.visualAnchor.lighting}. Mood: ${result.narrativeArc.mood.join(', ')}. The storyboard shows technical camera angles. No text inside panels. Dark background.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate storyboard image");
}
