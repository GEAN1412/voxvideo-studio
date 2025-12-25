
import React from 'react';

export const VideoGenerator: React.FC = () => {
  return (
    <div className="relative min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 italic tracking-tight">FITUR TERKUNCI</h3>
      <p className="text-slate-400 max-w-sm mb-8">Fitur Text-to-Video membutuhkan Billing GCP diaktifkan.</p>
    </div>
  );
};
