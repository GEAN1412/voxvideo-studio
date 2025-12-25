
export type Tab = 'voice' | 'video' | 'image';

export interface User {
  id?: string;
  email: string;
  charCount: number; // Menggantikan wordCount untuk pelacakan karakter
  imageCount: number;
  voiceSubscribedUntil: number | null;
  imageSubscribedUntil: number | null;
  paymentStatus: 'none' | 'pending' | 'approved';
  lastPaymentRef?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Kore', description: 'Deep & Professional' },
  { id: 'Puck', name: 'Puck', description: 'Energetic & Youthful' },
  { id: 'Charon', name: 'Charon', description: 'Calm & Wise' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Strong & Narrative' },
  { id: 'Zephyr', name: 'Zephyr', description: 'Friendly & Bright' }
];

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type Resolution = '720p' | '1080p';

// Ganti email ini dengan email admin Anda
export const ADMIN_EMAIL = 'admin@voxvideo.com';
export const FREE_CHAR_LIMIT = 1000; // Limit baru: 1000 karakter
export const FREE_IMAGE_LIMIT = 5;
export const PRICE_VOICE = 15000;
export const PRICE_IMAGE = 50000;

export const DANA_NUMBER = "0877-2586-0048";
export const DANA_NAME = "GEAN PRATAMA Adiaksa";

// KONFIGURASI SUPABASE (Dapatkan dari Dashboard Supabase Anda)
export const SUPABASE_URL = "https://yvfyotliopcvginafjce.supabase.co";
export const SUPABASE_KEY = "sb_publishable_IhMPfg4uf8M3SfPdLRGJxQ_JIcbijIz";
