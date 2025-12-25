
import { User, ADMIN_EMAIL, SUPABASE_URL, SUPABASE_KEY } from './types';

const SESSION_KEY = 'voxvideo_session';

const supabaseFetch = async (path: string, options: RequestInit = {}) => {
  const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, ...options.headers };
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const res = await supabaseFetch(`profiles?email=eq.${email}&select=*`);
  const data = await res.json();
  if (data?.[0]) {
    const u = data[0];
    return { email: u.email, charCount: u.word_count, imageCount: u.image_count, voiceSubscribedUntil: u.voice_premium_expiry, imageSubscribedUntil: u.image_premium_expiry, paymentStatus: u.payment_status, lastPaymentRef: u.last_payment_ref };
  }
  return null;
};

export const isSubscribed = (user: User | null, type: 'voice' | 'image'): boolean => {
  if (!user) return false;
  const expiry = type === 'voice' ? user.voiceSubscribedUntil : user.imageSubscribedUntil;
  return !!(expiry && expiry > Date.now());
};

export const loginOrRegister = async (email: string): Promise<User> => {
  const res = await supabaseFetch(`profiles?email=eq.${email}&select=*`);
  const data = await res.json();
  if (data?.[0]) {
    localStorage.setItem(SESSION_KEY, email);
    return data[0];
  }
  const newProfile = { email, word_count: 0, image_count: 0, payment_status: 'none' };
  const createRes = await supabaseFetch('profiles', { method: 'POST', body: JSON.stringify(newProfile), headers: { 'Prefer': 'return=representation' } });
  const created = await createRes.json();
  localStorage.setItem(SESSION_KEY, email);
  return created[0];
};

export const logout = () => { localStorage.removeItem(SESSION_KEY); };

export const updateUser = async (updates: Partial<User>) => {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return;
  const dbUpdates: any = {};
  if (updates.charCount !== undefined) dbUpdates.word_count = updates.charCount;
  if (updates.imageCount !== undefined) dbUpdates.image_count = updates.imageCount;
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.lastPaymentRef !== undefined) dbUpdates.last_payment_ref = updates.lastPaymentRef;
  await supabaseFetch(`profiles?email=eq.${email}`, { method: 'PATCH', body: JSON.stringify(dbUpdates) });
};

export const getAllUsers = async (): Promise<User[]> => {
  const res = await supabaseFetch('profiles?select=*&order=created_at.desc');
  const data = await res.json();
  return data.map((u: any) => ({ email: u.email, charCount: u.word_count, paymentStatus: u.payment_status, lastPaymentRef: u.last_payment_ref }));
};

export const adminApproveUser = async (email: string, type: 'voice' | 'image') => {
  const expiry = Date.now() + (30 * 24 * 3600 * 1000);
  const dbUpdates: any = { payment_status: 'approved' };
  if (type === 'voice') dbUpdates.voice_premium_expiry = expiry;
  else dbUpdates.image_premium_expiry = expiry;
  await supabaseFetch(`profiles?email=eq.${email}`, { method: 'PATCH', body: JSON.stringify(dbUpdates) });
};
