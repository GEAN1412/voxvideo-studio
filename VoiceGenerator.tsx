
import React, { useState, useEffect } from 'react';
import { VOICES, FREE_CHAR_LIMIT, ADMIN_EMAIL, User } from './types';
import { generateTTS } from './geminiService';
import { audioBufferToWav } from './audio';
import { getCurrentUser, updateUser, isSubscribed } from './authService';
import { PaymentModal } from './PaymentModal';

export const VoiceGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const u = await getCurrentUser();
    setUser(u);
  };

  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async (targetText: string, voiceId: string, isTest: boolean = false) => {
    if (!targetText.trim()) return;
    const charCount = targetText.length;

    if (!isTest && user?.email !== ADMIN_EMAIL && !isSubscribed(user, 'voice')) {
      if ((user?.charCount || 0) + charCount > FREE_CHAR_LIMIT) {
        setShowPayment(true);
        return;
      }
    }

    if (isTest) setTestingVoiceId(voiceId);
    else {
      setIsGenerating(true);
      setAudioUrl(null);
    }
    
    setError(null);

    try {
      const { audioBuffer, audioContext } = await generateTTS(targetText, voiceId);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

      if (!isTest) {
        const wavBlob = audioBufferToWav(audioBuffer);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
        if (user?.email !== ADMIN_EMAIL) {
          await updateUser({ charCount: (user?.charCount || 0) + charCount });
          fetchUser();
        }
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Gagal menghasilkan suara";
      
      // Jika error terkait API Key
      if (errMsg.toLowerCase().includes("api key") || errMsg.includes("400") || errMsg.toLowerCase().includes("not found")) {
        errMsg = "API Key tidak valid atau billing belum aktif. Klik icon kunci di header untuk mengatur ulang.";
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
          // Opsional: Langsung tawarkan buka dialog jika error fatal
          if (window.confirm("API Key bermasalah. Ingin memilih Key baru sekarang?")) {
             window.aistudio.openSelectKey();
          }
        }
      }
      
      setError(errMsg);
    } finally {
      if (isTest) setTestingVoiceId(null);
      else setIsGenerating(false);
    }
  };

  const isUnlimited = user?.email === ADMIN_EMAIL || isSubscribed(user, 'voice');
  const currentCharCount = text.length;

  return (
    <div className="space-y-6">
      {showPayment && <PaymentModal type="voice" onClose={() => setShowPayment(false)} onSuccess={() => setShowPayment(false)} />}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-white">Generator Suara</h3>
        <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono">
          {isUnlimited ? <span className="text-emerald-400">● UNLIMITED</span> : <span className="text-blue-400">Sisa: {Math.max(0, FREE_CHAR_LIMIT - (user?.charCount || 0))} karakter</span>}
        </div>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <textarea 
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]" 
          placeholder="Masukkan teks..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <p className="mt-2 text-xs text-slate-500 text-right">{currentCharCount} / {isUnlimited ? '∞' : FREE_CHAR_LIMIT} karakter</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VOICES.map((voice) => (
          <button 
            key={voice.id} 
            onClick={() => setSelectedVoice(voice.id)} 
            className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between group ${selectedVoice === voice.id ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/50' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'}`}
          >
            <div className="flex flex-col">
              <span className="font-bold text-slate-100">{voice.name}</span>
              <span className="text-xs text-slate-400">{voice.description}</span>
            </div>
            <div onClick={(e) => { e.stopPropagation(); handleGenerate("Halo", voice.id, true); }} className="p-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors">
              {testingVoiceId === voice.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>}
            </div>
          </button>
        ))}
      </div>
      
      {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl text-sm leading-relaxed">{error}</div>}
      
      {audioUrl && (
        <button onClick={() => { const l=document.createElement('a'); l.href=audioUrl; l.download=`voice-${Date.now()}.wav`; l.click(); }} className="w-full py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl text-white flex items-center justify-center space-x-2 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span>Unduh (.wav)</span>
        </button>
      )}

      <button onClick={() => handleGenerate(text, selectedVoice)} disabled={isGenerating || !text.trim()} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2">
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Memproses...</span>
          </>
        ) : (
          <span>Generate Suara</span>
        )}
      </button>
    </div>
  );
};
