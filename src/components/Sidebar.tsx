'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/src/hooks/useUserStore';

const NAV = [
  { href: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { href: '/habits', icon: '✦', label: 'Odatlar' },
  { href: '/weeks', icon: '◫', label: 'Haftalar' },
  { href: '/stats', icon: '◈', label: 'Statistika' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserStore();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ─── MOBILE: Bottom navigation bar ───────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Bottom nav */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)', // iPhone notch
        }}>
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '10px 4px 8px',
                  textDecoration: 'none',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 0.15s',
                  minHeight: 56,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.01em',
                }}>
                  {label}
                </span>
                {active && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% - 2px)',
                    width: 20, height: 2,
                    borderRadius: 1,
                    background: 'var(--accent)',
                  }} />
                )}
              </Link>
            );
          })}

          {/* User avatar button */}
          <button
            onClick={() => setShowUserMenu(true)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 4px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              minHeight: 56,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c6aff, #ff6ab0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 10 }}>Profil</span>
          </button>
        </nav>

        {/* User menu bottom sheet */}
        {showUserMenu && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            }}
            onClick={() => setShowUserMenu(false)}
          >
            <div
              className="card animate-fadeUp"
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                borderRadius: '20px 20px 0 0',
                padding: '20px 24px 40px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'var(--border)', margin: '0 auto 20px',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c6aff, #ff6ab0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {user?.phone}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ width: '100%', padding: '14px', fontSize: 14, justifyContent: 'center' }}
              >
                ← Chiqish
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── DESKTOP: Sidebar ──────────────────────────────────────────────────────
  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      padding: '28px 16px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, paddingLeft: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #7c6aff, #ff6ab0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🌱</div>
        <span className="font-display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
          HabitFlow
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                transition: 'all var(--transition)',
                background: active ? 'rgba(124,106,255,0.12)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.phone}</div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, padding: '9px 12px' }}
        >
          ← Chiqish
        </button>
      </div>
    </aside>
  );
}