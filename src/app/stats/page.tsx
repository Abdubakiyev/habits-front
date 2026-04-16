'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserStore } from '@/src/hooks/useUserStore';
import { useHabits } from '@/src/hooks/useHabits';
import { useWeeks, useHabitStats, useWeekStats } from '@/src/hooks/useDashboard';
import Sidebar from '@/src/components/Sidebar';


// Responsive hook
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

function RadialProgress({
  value,
  size = 80,
  color = 'var(--accent)',
}: {
  value: number;
  size?: number;
  color?: string;
}) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dy="0.35em"
        fill="var(--text-primary)"
        fontSize={size * 0.22}
        fontWeight={700}
        fontFamily="var(--font-display)"
      >
        {value}%
      </text>
    </svg>
  );
}

function HabitStatsCard({ userId, habitId }: { userId: string; habitId: string }) {
  const { stats, loading } = useHabitStats(userId, habitId);
  const isMobile = useIsMobile();

  if (loading) return <div className="skeleton" style={{ height: isMobile ? 110 : 140 }} />;
  if (!stats) return null;

  const pct = parseFloat(stats.completionRate);
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  const radialSize = isMobile ? 64 : 80;

  return (
    <div className="card" style={{ display: 'flex', gap: isMobile ? 14 : 20, alignItems: 'center' }}>
      <RadialProgress value={Math.round(pct)} size={radialSize} color={color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="font-display"
          style={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            marginBottom: 6,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {stats.habit.icon && `${stats.habit.icon} `}{stats.habit.name}
        </div>
        <div style={{
          display: 'flex',
          gap: isMobile ? 10 : 16,
          fontSize: isMobile ? 12 : 13,
          flexWrap: 'wrap',
        }}>
          <div>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{stats.completedDays}</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>bajarildi</span>
          </div>
          <div>
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{stats.missedDays}</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>o'tkazildi</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{stats.totalDays}</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>jami</span>
          </div>
        </div>

        {isMobile && (
          <div style={{
            marginTop: 8, height: 3, borderRadius: 2,
            background: 'var(--border)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: color, borderRadius: 2,
              transition: 'width 0.6s ease',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function WeekStatsCard({ weekId }: { weekId: string }) {
  const { stats, loading } = useWeekStats(weekId);
  const isMobile = useIsMobile();

  if (loading) return <div className="skeleton" style={{ height: isMobile ? 100 : 120 }} />;
  if (!stats) return null;

  const pct = parseFloat(stats.completionRate);
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  const radialSize = isMobile ? 64 : 80;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20 }}>
      <RadialProgress value={Math.round(pct)} size={radialSize} color={color} />
      <div style={{ flex: 1 }}>
        <div className="font-display" style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, marginBottom: 6 }}>
          {stats.week.weekNumber}-hafta
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 10 : 16, fontSize: isMobile ? 12 : 13, flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{stats.completedTracks}</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>bajarildi</span>
          </div>
          <div>
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{stats.missedTracks}</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>o'tkazildi</span>
          </div>
        </div>

        {isMobile && (
          <div style={{
            marginTop: 8, height: 3, borderRadius: 2,
            background: 'var(--border)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: color, borderRadius: 2,
              transition: 'width 0.6s ease',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatsContent() {
  const { user } = useUserStore();
  const { habits } = useHabits(user?.id);
  const { weeks } = useWeeks();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'habits' | 'weeks'>('habits');

  useEffect(() => {
    if (searchParams.get('weekId')) setTab('weeks');
  }, [searchParams]);

  if (!user) return null;

  return (
    <div className="animate-fadeUp" style={{ paddingBottom: isMobile ? 80 : 0 }}>
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <h1 className="font-display" style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
          Statistika
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Odatlaringiz va haftalaringiz bo'yicha tahlil
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: isMobile ? 16 : 24 }}>
        {(['habits', 'weeks'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn"
            style={{
              flex: isMobile ? 1 : undefined,
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-secondary)',
              border: tab === t ? 'none' : '1px solid var(--border)',
              fontSize: isMobile ? 13 : 14,
              padding: isMobile ? '10px 0' : undefined,
            }}
          >
            {t === 'habits' ? '✦ Odatlar' : '◫ Haftalar'}
          </button>
        ))}
      </div>

      {tab === 'habits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
          {habits.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: isMobile ? 32 : 40 }}>
              <p style={{ color: 'var(--text-muted)' }}>Hali odatlar yo'q</p>
            </div>
          )}
          {habits.map((h) => (
            <HabitStatsCard key={h.id} userId={user.id} habitId={h.id} />
          ))}
        </div>
      )}

      {tab === 'weeks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
          {weeks.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: isMobile ? 32 : 40 }}>
              <p style={{ color: 'var(--text-muted)' }}>Hali haftalar yo'q</p>
            </div>
          )}
          {weeks.map((w) => (
            <WeekStatsCard key={w.id} weekId={w.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
        <Suspense fallback={<div className="spinner" style={{ width: 32, height: 32, margin: '60px auto' }} />}>
          <StatsContent />
        </Suspense>
      </main>
    </div>
  );
}