
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from "./audio";

// Selalu buat instance baru saat dipanggil untuk memastikan API_KEY terbaru digunakan
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTTS = async (text: string, voiceName: string) => {
  const ai = getAI();
  const prompt = `Read this text clearly: "${text}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
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
    if (!base64Audio) throw new Error("Gagal mendapatkan data audio dari AI.");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    
    return { audioBuffer, audioContext };
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Gagal menghasilkan gambar.");
  } catch (error: any) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};
