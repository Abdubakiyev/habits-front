'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/src/hooks/useUserStore';

export default function AuthPage() {
  const router = useRouter();
  const { register, login, loading, error, clearError } = useUserStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    setLocalError('');
    clearError();
    if (!phone.trim()) return setLocalError('Telefon raqam kiriting');
    if (mode === 'register' && !name.trim()) return setLocalError('Ism kiriting');

    try {
      if (mode === 'register') {
        await register({ name: name.trim(), phone: phone.trim() });
      } else {
        await login(phone.trim());
      }
      router.push('/dashboard');
    } catch {
      // error is set by store
    }
  };

  const displayError = localError || error;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Mobile: 24px sides, 48px top/bottom — Desktop: 60px all sides
      padding: 'clamp(48px, 8vw, 60px) clamp(16px, 5vw, 60px)',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 800, height: 800,
        background: 'radial-gradient(circle, rgba(124,106,255,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #7c6aff, #ff6ab0)',
            fontSize: 24, marginBottom: 16,
            boxShadow: '0 8px 32px rgba(124,106,255,0.4)',
          }}>🌱</div>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            HabitFlow
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            Odatlarni qurib, yaxshi hayot kechir
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
            padding: 4, marginBottom: 24,
          }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setLocalError(''); clearError(); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
                  background: mode === m ? 'var(--bg-card-2)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  // Min touch target
                  minHeight: 44,
                }}
              >
                {m === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label className="label">Ism</label>
                <input
                  className="input"
                  placeholder="Abdulloh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  // fontSize 16 prevents iOS auto-zoom
                  style={{ fontSize: 16 }}
                />
              </div>
            )}
            <div>
              <label className="label">Telefon raqam</label>
              <input
                className="input"
                placeholder="+998901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                inputMode="tel"
                style={{ fontSize: 16 }}
              />
            </div>

            {displayError && (
              <div style={{
                background: 'rgba(255,79,110,0.1)', border: '1px solid rgba(255,79,110,0.3)',
                borderRadius: 'var(--radius-xs)', padding: '10px 14px',
                fontSize: 13, color: 'var(--danger)',
              }}>
                ⚠️ {displayError}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 4, minHeight: 48 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Yuklanmoqda...</>
                : (mode === 'login' ? 'Kirish →' : "Ro'yxatdan o'tish →")
              }
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Hisob yo'qmi?" : 'Hisob bormi?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalError(''); clearError(); }}
            style={{
              background: 'none', border: 'none', color: 'var(--accent)',
              cursor: 'pointer', fontSize: 13, textDecoration: 'underline',
              minHeight: 44, padding: '0 4px',
            }}
          >
            {mode === 'login' ? "Ro'yxatdan o'ting" : 'Kiring'}
          </button>
        </p>
      </div>
    </div>
  );
}