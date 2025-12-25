
import React, { useState, useEffect } from 'react';
import { getAllUsers, adminApproveUser } from './authService';
import { User } from './types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { refreshData(); }, []);

  const handleApprove = async (email: string) => {
    if (window.confirm(`Aktifkan Premium untuk ${email}?`)) {
      await adminApproveUser(email, 'voice');
      alert("Berhasil diaktifkan!");
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Panel Kontrol Cloud</h3>
      <div className="grid grid-cols-1 gap-4">
        {users.map((u) => (
          <div key={u.email} className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-bold text-white">{u.email}</p>
              <p className="text-xs text-slate-400">Total: {u.charCount} karakter | Status: {u.paymentStatus}</p>
            </div>
            {u.paymentStatus === 'pending' && (
              <button onClick={() => handleApprove(u.email)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">APPROVE</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
