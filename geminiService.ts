
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from "./audio";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTTS = async (text: string, voiceName: string) => {
  const ai = getAI();
  const prompt = `Read out loud: "${text}"`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Gagal audio");
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
  return { audioBuffer, audioContext };
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: aspectRatio as any } },
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  throw new Error("Gagal gambar");
};
