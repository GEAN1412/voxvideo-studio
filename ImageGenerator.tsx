
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
      setError(err.message || "Gagal generate");
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
      <textarea className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none min-h-[100px]" placeholder="Jelaskan gambar yang ingin dibuat..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      {imageUrl && <img src={imageUrl} className="rounded-xl w-full border border-slate-700 shadow-xl" />}
      <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">{isGenerating ? 'Memproses...' : 'Generate Gambar'}</button>
    </div>
  );
};
