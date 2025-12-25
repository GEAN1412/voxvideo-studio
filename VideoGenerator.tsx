
import React, { useState } from 'react';
import { generateVideo } from './geminiService';
import { AspectRatio, Resolution, ADMIN_EMAIL, User } from './types';
import { getCurrentUser, isSubscribed } from './authService';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Cek Akses (Video biasanya fitur paling mahal, kita batasi ke Admin/Premium)
    const user = await getCurrentUser();
    if (user?.email !== ADMIN_EMAIL && !isSubscribed(user, 'voice')) { // Menggunakan subscription voice sebagai syarat sementara
      setError("Fitur Video hanya tersedia untuk pengguna Premium/Admin.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgress("Memulai koneksi ke Veo...");

    try {
      const url = await generateVideo(prompt, aspectRatio, resolution, (msg) => {
        setProgress(msg);
      });
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal membuat video. Pastikan kuota Tier 1 Anda mencukupi.");
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span>AI Video Studio (Veo 3.1)</span>
        </h3>
        <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
          High Quality Tier
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Prompt Video</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] transition-all"
            placeholder="Contoh: Seekor kucing astronot sedang berjalan di bulan dengan latar belakang bumi yang bercahaya, gaya cinematic..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Aspek Rasio</label>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
              {(['16:9', '9:16'] as AspectRatio[]).map(r => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === r ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {r === '16:9' ? 'Horizontal' : 'Vertical'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Resolusi</label>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
              {(['720p', '1080p'] as Resolution[]).map(res => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${resolution === res ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="p-10 bg-slate-800/30 border border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-600/20 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-500 rounded-full animate-spin-reverse"></div>
            </div>
          </div>
          <div>
            <p className="text-white font-bold">{progress}</p>
            <p className="text-slate-500 text-xs mt-1 italic">Proses ini memakan waktu sekitar 1-2 menit...</p>
          </div>
        </div>
      )}

      {videoUrl && !isGenerating && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[2rem] overflow-hidden border border-slate-700 bg-black shadow-2xl aspect-video md:aspect-auto">
            <video src={videoUrl} controls className="w-full max-h-[500px]" autoPlay loop />
          </div>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = videoUrl;
              a.download = `voxvideo-${Date.now()}.mp4`;
              a.click();
            }}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Unduh Video (MP4)</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-2xl text-sm flex items-start space-x-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center space-x-3 ${
          isGenerating || !prompt.trim() 
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
          : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:scale-[1.02] active:scale-95 shadow-purple-500/20'
        }`}
      >
        {isGenerating ? (
          <span>SEDANG MERENDER...</span>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <span>GENERATE VIDEO VEO</span>
          </>
        )}
      </button>
    </div>
  );
};
