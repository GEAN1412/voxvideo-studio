
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
  const [isCopying, setIsCopying] = useState(false);

  const loadUser = async () => {
    const u = await getCurrentUser();
    setUser(u);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
    const interval = setInterval(loadUser, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
      setUser(null);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke Cloud Studio...</p>
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
              <h1 className="text-base font-black text-white leading-none tracking-tight">VOXVIDEO <span className="text-blue-500">AI</span></h1>
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
              <button onClick={handleShare} title="Salin Link" className={`p-2 rounded-lg transition-all ${isCopying ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {isCopying ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
              </button>
              <button onClick={handleLogout} title="Keluar" className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        {!isAdmin && user.paymentStatus === 'pending' && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-4 animate-pulse">
            <div className="p-2 bg-amber-500 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-amber-500 text-sm font-bold">Pembayaran Sedang Diverifikasi</p>
              <p className="text-amber-500/70 text-xs">Admin sedang mengecek mutasi DANA. Akses Anda akan terbuka otomatis.</p>
            </div>
          </div>
        )}

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
