import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODELS = ['gemini-3.8-flash'];

// GEMINI_MODELS is a comma-separated priority list — first is primary, the rest are fallbacks
// tried in order only when an earlier one actually errors (rate limit, outage, etc). Keeping this
// in env instead of hardcoding a single model name means a rate-limited or retired model doesn't
// take every AI feature down with it.
function getModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODELS;
  if (!configured) return DEFAULT_MODELS;
  const models = configured
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return models.length > 0 ? models : DEFAULT_MODELS;
}

interface GenerateOptions {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
}

// Shared by every Gemini call site in this app. Returns null (never a fabricated string) if
// there's no API key or every candidate model in GEMINI_MODELS failed — callers supply their own
// fallback behavior for that case.
export async function generateWithGemini(
  options: GenerateOptions,
): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  for (const model of getModelCandidates()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.4,
        },
      });
      if (response.text) {
        return { text: response.text, model };
      }
    } catch (error: unknown) {
      console.warn(`Gemini call failed for model "${model}", trying next candidate if any:`, error);
    }
  }

  return null;
}

// Extracted from the try/catch-and-fall-through shape in
// app/api/v1/gemini/assistant/route.ts, but returns null on any failure/missing key instead of a
// canned chat response — callers (e.g. investigation generation) supply their own fallback text,
// since Gemini here is only asked to polish prose, never to decide anything load-bearing.
export async function generateSummary(prompt: string): Promise<string | null> {
  const result = await generateWithGemini({
    contents: prompt,
    systemInstruction:
      'You write a concise 2-3 sentence plain-English summary of an industrial root-cause investigation from the evidence given. No markdown, no bullet points, just prose.',
    temperature: 0.4,
  });
  return result?.text ?? null;
}
