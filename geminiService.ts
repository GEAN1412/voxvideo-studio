
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

export const generateVideo = async (
  prompt: string, 
  aspectRatio: string, 
  resolution: string,
  onProgress?: (msg: string) => void
) => {
  const ai = getAI();
  onProgress?.("Menyiapkan permintaan ke Veo...");
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution as any,
        aspectRatio: aspectRatio as any
      }
    });

    const statusMessages = [
      "Menganalisa komposisi visual...",
      "Merender frame video...",
      "Menyusun animasi AI...",
      "Finalisasi pixel...",
      "Hampir selesai, sedang mengunggah..."
    ];
    let msgIndex = 0;

    while (!operation.done) {
      onProgress?.(statusMessages[msgIndex % statusMessages.length]);
      msgIndex++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video gagal dibuat oleh model.");

    // Harus menyertakan API Key saat fetch link video dari Google Cloud
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Veo Video Error:", error);
    throw error;
  }
};
