import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Suggestion {
  original: string;
  suggestion: string;
  explanation: string;
  type: 'grammar' | 'spelling' | 'style' | 'tone';
}

export interface AnalysisResult {
  correctedText: string;
  suggestions: Suggestion[];
  summary: string;
}

export async function analyzeText(text: string, language: string, tone: string): Promise<AnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are an expert linguistic assistant for Indian vernacular languages. 
Your task is to analyze text in ${language} and provide grammar, spelling, and style improvements.
The desired tone is ${tone}.

For the given text, you must:
1. Identify grammatical errors (verb conjugation, postpositions, gender agreement, sentence order).
2. Identify spelling and typographical errors.
3. Suggest sentence rephrasing for better fluency and clarity.
4. Maintain the original semantic meaning and cultural nuances.

Return the result in JSON format with the following structure:
{
  "correctedText": "The full text with all improvements applied",
  "suggestions": [
    {
      "original": "the specific part of the original text",
      "suggestion": "the improved version of that part",
      "explanation": "why this change is suggested in English",
      "type": "grammar" | "spelling" | "style" | "tone"
    }
  ],
  "summary": "A brief summary of the changes made in English"
}`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correctedText: { type: Type.STRING },
          summary: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                explanation: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["grammar", "spelling", "style", "tone"] }
              },
              required: ["original", "suggestion", "explanation", "type"]
            }
          }
        },
        required: ["correctedText", "suggestions", "summary"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to analyze text. Please try again.");
  }
}

export interface TranslationResult {
  translatedText: string;
  transliteration?: string;
  detectedLanguage?: string;
}

export async function translateText(text: string, targetLanguage: string): Promise<TranslationResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a professional translator specializing in Indian languages.
Translate the provided text into ${targetLanguage}.
Also provide a transliteration (Roman script) of the translated text if the target language uses a non-Latin script.
Detect the source language automatically.

Return the result in JSON format:
{
  "translatedText": "The translated text in the native script",
  "transliteration": "The transliteration in Roman script (optional)",
  "detectedLanguage": "The name of the detected source language in English"
}`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedText: { type: Type.STRING },
          transliteration: { type: Type.STRING },
          detectedLanguage: { type: Type.STRING }
        },
        required: ["translatedText", "detectedLanguage"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as TranslationResult;
  } catch (e) {
    console.error("Failed to parse translation response", e);
    throw new Error("Failed to translate text.");
  }
}

export async function generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
  const model = "gemini-2.5-flash-preview-tts";
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate speech audio.");
  }
  
  return base64Audio;
}
