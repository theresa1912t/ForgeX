import { GoogleGenAI } from '@google/genai';

// Extracted from the try/catch-and-fall-through shape in
// app/api/v1/gemini/assistant/route.ts, but returns null on any failure/missing key instead of a
// canned chat response — callers (e.g. investigation generation) supply their own fallback text,
// since Gemini here is only asked to polish prose, never to decide anything load-bearing.
export async function generateSummary(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You write a concise 2-3 sentence plain-English summary of an industrial root-cause investigation from the evidence given. No markdown, no bullet points, just prose.',
        temperature: 0.4,
      },
    });

    return response.text || null;
  } catch (error: unknown) {
    console.warn('Gemini summary generation failed, caller will use its own fallback:', error);
    return null;
  }
}
