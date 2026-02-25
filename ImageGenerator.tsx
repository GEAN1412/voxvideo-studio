
import React, { useState, useEffect } from 'react';
import { generateImage } from './geminiService';
import { AspectRatio, FREE_IMAGE_LIMIT, ADMIN_EMAIL, User } from './types';
import { getCurrentUser, updateUser, isSubscribed } from './authService';
import { PaymentModal } from './PaymentModal';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser();
      setUser(u);
    };
    fetchUser();
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (user?.email !== ADMIN_EMAIL && !isSubscribed(user, 'image')) {
      if ((user?.imageCount || 0) >= FREE_IMAGE_LIMIT) {
        setShowPayment(true);
        return;
      }
    }
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateImage(prompt, aspectRatio);
      setImageUrl(url);
      if (user?.email !== ADMIN_EMAIL) {
        await updateUser({ imageCount: (user?.imageCount || 0) + 1 });
      }
    } catch (err: any) {
      let msg = err.message || "Gagal generate";
      if (msg.includes("429") || msg.includes("QUOTA_EXHAUSTED") || msg.includes("quota")) {
        msg = "Kuota Habis (Error 429): Batas penggunaan API tercapai. Silakan tunggu sebentar atau cek pengaturan billing Anda.";
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const isUnlimited = user?.email === ADMIN_EMAIL || isSubscribed(user, 'image');

  return (
    <div className="space-y-6">
      {showPayment && <PaymentModal type="image" onClose={() => setShowPayment(false)} onSuccess={() => setShowPayment(false)} />}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Generator Gambar</h3>
        <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono">
          {isUnlimited ? <span className="text-emerald-400">● UNLIMITED</span> : <span className="text-emerald-400">Quota: {FREE_IMAGE_LIMIT - (user?.imageCount || 0)} sisa</span>}
        </div>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Prompt Gambar</label>
          <textarea 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] transition-all resize-none" 
            placeholder="Jelaskan gambar yang ingin dibuat..." 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Aspek Rasio</label>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
            {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(r => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === r ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {r === '1:1' ? 'Square' : r === '16:9' ? 'Horizontal' : 'Vertical'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {imageUrl && (
        <div className="relative group animate-in fade-in zoom-in duration-500">
          <img src={imageUrl} className="rounded-xl w-full border border-slate-700 shadow-2xl" alt="Generated" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
             <button onClick={() => { const a=document.createElement('a'); a.href=imageUrl; a.download=`img-${Date.now()}.png`; a.click(); }} className="p-3 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             </button>
          </div>
        </div>
      )}

      <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2">
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Memproses Gambar...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Generate Gambar</span>
          </>
        )}
      </button>
    </div>
  );
};
