
import React, { useState } from 'react';
import { PRICE_VOICE, PRICE_IMAGE, DANA_NUMBER, DANA_NAME } from './types';
import { updateUser } from './authService';

interface PaymentModalProps {
  type: 'voice' | 'image';
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ type, onClose, onSuccess }) => {
  const [refName, setRefName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const price = type === 'voice' ? PRICE_VOICE : PRICE_IMAGE;

  const handleConfirm = async () => {
    if (!refName.trim()) return;
    setIsProcessing(true);
    try {
      await updateUser({ paymentStatus: 'pending', lastPaymentRef: refName });
      alert("Konfirmasi terkirim! Admin akan mengecek pembayaran Anda.");
      onSuccess();
    } catch (e) { alert("Terjadi kesalahan."); } finally { setIsProcessing(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Aktivasi Premium</h3>
        <p className="text-slate-400 mb-6 text-sm">Kirim Rp {price.toLocaleString('id-ID')} ke DANA {DANA_NUMBER} a.n {DANA_NAME}</p>
        <input type="text" placeholder="Masukkan Nama di Akun DANA Anda" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white mb-4 outline-none focus:ring-2 focus:ring-blue-500" value={refName} onChange={(e) => setRefName(e.target.value)} />
        <button onClick={handleConfirm} disabled={isProcessing || !refName.trim()} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">{isProcessing ? 'Mengirim...' : 'Saya Sudah Bayar'}</button>
        <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-white mt-4 text-sm">Nanti Saja</button>
      </div>
    </div>
  );
};
