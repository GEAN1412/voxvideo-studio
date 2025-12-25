
import React, { useState, useEffect } from 'react';
import { VoiceGenerator } from './VoiceGenerator';
import { VideoGenerator } from './VideoGenerator';
import { ImageGenerator } from './ImageGenerator';
import { AdminDashboard } from './AdminDashboard';
import { Auth } from './Auth';
import { Tab, ADMIN_EMAIL, User } from './types';
import { getCurrentUser, logout } from './authService';

type ExtendedTab = Tab | 'admin';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExtendedTab>('voice');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const checkKey = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
      return selected;
    }
    // Jika bukan di lingkungan AI Studio (misal local development)
    setHasApiKey(true);
    return true;
  };

  const loadUser = async () => {
    await checkKey();
    const u = await getCurrentUser();
    setUser(u);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
    // Cek berkala untuk memastikan jika user ganti key di header, UI terupdate
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Langsung asumsikan sukses setelah dialog dibuka untuk menghindari race condition
      setHasApiKey(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke Cloud...</p>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Aktivasi Cloud AI</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Project Anda terdeteksi sudah Tier 1. Silakan pilih kembali API Key dari project tersebut untuk mengaktifkan fitur premium.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Pilih API Key
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block mt-4 text-xs text-slate-500 hover:text-blue-400 transition-colors">
            Pelajari tentang Billing API Key
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={loadUser} />;
  }

  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen pb-12 bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-none tracking-tight uppercase">VOXVIDEO <span className="text-blue-500">AI</span></h1>
              <p className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{user.email.split('@')[0]}</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-3">
            <div className="hidden md:flex p-1 bg-slate-800/50 rounded-xl border border-slate-700">
              {(['voice', 'image', 'video'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
                    activeTab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
                    activeTab === 'admin' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  ADMIN
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
              <button onClick={handleSelectKey} title="Ganti API Key" className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </button>
              <button onClick={handleLogout} title="Keluar" className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        <div className="relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r blur opacity-20 group-hover:opacity-30 transition duration-1000 ${
            activeTab === 'voice' ? 'from-blue-600 to-indigo-600' : 
            activeTab === 'image' ? 'from-emerald-600 to-teal-600' : 
            activeTab === 'admin' ? 'from-red-600 to-orange-600' : 'from-purple-600 to-pink-600'
          }`}></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-800 p-8 md:p-12 shadow-2xl">
            {activeTab === 'voice' && <VoiceGenerator />}
            {activeTab === 'image' && <ImageGenerator />}
            {activeTab === 'video' && <VideoGenerator />}
            {activeTab === 'admin' && isAdmin && <AdminDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
