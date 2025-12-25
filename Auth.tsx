
import React, { useState } from 'react';
import { loginOrRegister } from './authService';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setIsSubmitting(true);
      try {
        await loginOrRegister(email);
        onLogin();
      } catch (err) { alert("Gagal masuk. Cek koneksi internet."); } finally { setIsSubmitting(false); }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           </div>
           <h2 className="text-3xl font-bold text-white">Login Studio</h2>
           <p className="text-slate-500 text-sm mt-2">Akses kreasi AI Anda di mana saja</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" required className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all">{isSubmitting ? 'Menghubungkan...' : 'Masuk ke Studio'}</button>
        </form>
      </div>
    </div>
  );
};
