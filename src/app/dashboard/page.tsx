'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/src/hooks/useUserStore';
import { useDashboard, useToggleTrack, useWeeks } from '@/src/hooks/useDashboard';
import { useHabits } from '@/src/hooks/useHabits';
import { HabitTrack } from '@/src/types';
import Link from 'next/link';
import Sidebar from '@/src/components/Sidebar';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
}

function getWeekDays(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

const DAY_LABELS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

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

export default function DashboardPage() {
  const { user } = useUserStore();
  const { dashboard, loading, error, refetch } = useDashboard(user?.id);
  const { weeks, createWeek } = useWeeks();
  const { habits } = useHabits(user?.id);
  const { toggle } = useToggleTrack();
  const [trackMap, setTrackMap] = useState<Record<string, HabitTrack>>({});
  const [creatingWeek, setCreatingWeek] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const map: Record<string, HabitTrack> = {};
    dashboard.forEach(({ habits: dHabits }) => {
      dHabits.forEach((h) => {
        h.tracks.forEach((t) => {
          map[`${h.id}_${t.trackDate.split('T')[0]}`] = t;
        });
      });
    });
    setTrackMap(map);
  }, [dashboard]);

  const handleToggle = async (habitId: string, weekId: string, date: string) => {
    const key = `${habitId}_${date}`;
    const existing = trackMap[key];
    const isCompleted = existing ? !existing.isCompleted : true;
    try {
      const updated = await toggle({ habitId, weekId, trackDate: date, isCompleted });
      setTrackMap((prev) => ({ ...prev, [key]: updated }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCurrentWeek = async () => {
    setCreatingWeek(true);
    try {
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekNum = getWeekNumber(now);
      await createWeek({
        weekNumber: weekNum,
        startDate: monday.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0],
      });
      await refetch();
    } finally {
      setCreatingWeek(false);
    }
  };

  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const totalHabits = habits.length;
  const today = getToday();
  const completedToday = habits.filter((h) => {
    const key = `${h.id}_${today}`;
    return trackMap[key]?.isCompleted;
  }).length;

  return (
    // FIX: display:flex + minHeight, Sidebar o'z kengligini o'zi egallaydi — marginLeft kerak emas
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{
        flex: 1,
        minWidth: 0, // FIX: flex child overflow oldini olish
        padding: isMobile ? '16px 16px 80px' : '32px 28px', // FIX: mobile bottom nav uchun paddingBottom content ichida
        overflowY: 'auto',
      }}>
        <div className="animate-fadeUp">
          {/* Header */}
          <div style={{ marginBottom: isMobile ? 20 : 32 }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <h1 className="font-display" style={{
                  fontSize: isMobile ? 22 : 28,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}>
                  Salom, {user?.name} 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13 }}>
                  {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  onClick={handleCreateCurrentWeek}
                  disabled={creatingWeek}
                  style={{ fontSize: isMobile ? 13 : 14, padding: isMobile ? '9px 14px' : undefined }}
                >
                  {creatingWeek ? '...' : '+ Bu hafta'}
                </button>
                <Link
                  href="/habits"
                  className="btn btn-primary"
                  style={{
                    textDecoration: 'none',
                    fontSize: isMobile ? 13 : 14,
                    padding: isMobile ? '9px 14px' : undefined,
                  }}
                >
                  + Odat
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, minmax(140px, 1fr))',
              gap: isMobile ? 8 : 12,
              marginTop: isMobile ? 16 : 20,
            }}>
              {[
                { label: 'Bugun', value: `${completedToday}/${totalHabits}`, color: 'var(--success)' },
                { label: 'Odatlar', value: totalHabits, color: 'var(--accent)' },
                { label: 'Haftalar', value: weeks.length, color: 'var(--warning)' },
              ].map((s) => (
                <div key={s.label} className="card" style={{ padding: isMobile ? '12px 10px' : '14px 20px' }}>
                  <div style={{
                    fontSize: isMobile ? 20 : 22,
                    fontWeight: 700,
                    color: s.color,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: isMobile ? 11 : 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(255,79,110,0.1)', border: '1px solid rgba(255,79,110,0.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 16,
              fontSize: 13, color: 'var(--danger)',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          )}

          {/* Empty */}
          {!loading && dashboard.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: isMobile ? 40 : 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <h3 className="font-display" style={{ fontSize: isMobile ? 18 : 20, marginBottom: 8 }}>
                Hafta yo'q
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
                Boshlash uchun joriy haftani qo'shing
              </p>
              <button className="btn btn-primary" onClick={handleCreateCurrentWeek}>
                + Bu haftani qo'shish
              </button>
            </div>
          )}

          {/* Week grids */}
          {dashboard.map(({ week, habits: wHabits }, wi) => {
            const days = getWeekDays(week.startDate, week.endDate);

            return (
              <div
                key={week.id}
                className="card"
                style={{ marginBottom: isMobile ? 12 : 20, animationDelay: `${wi * 0.05}s` }}
              >
                {/* Week header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 14 : 20,
                }}>
                  <div>
                    <span className="font-display" style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>
                      {week.weekNumber}-hafta
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
                      {formatDate(week.startDate)} — {formatDate(week.endDate)}
                    </span>
                  </div>
                  <Link
                    href={`/stats?weekId=${week.id}`}
                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    Statistika →
                  </Link>
                </div>

                {wHabits.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '8px 0' }}>
                    Bu hafta uchun odatlar yo'q.{' '}
                    <Link href="/habits" style={{ color: 'var(--accent)' }}>Qo'shing →</Link>
                  </p>
                ) : isMobile ? (
                  // ─── MOBILE: Card list per habit ───────────────────────────
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {wHabits.map((habit) => {
                      const completed = days.filter((d) => trackMap[`${habit.id}_${d}`]?.isCompleted).length;
                      const pct = Math.round((completed / days.length) * 100);
                      return (
                        <div key={habit.id} style={{
                          background: 'var(--bg-card-2)',
                          borderRadius: 10,
                          padding: '12px 14px',
                          border: '1px solid var(--border)',
                        }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: 10,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: habit.color, flexShrink: 0,
                              }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {habit.icon && `${habit.icon} `}{habit.name}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 12, fontWeight: 700,
                              color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--text-muted)',
                            }}>
                              {pct}%
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                            {days.map((d, i) => {
                              const key = `${habit.id}_${d}`;
                              const track = trackMap[key];
                              const done = track?.isCompleted ?? false;
                              const isToday = d === today;
                              const future = d > today;
                              return (
                                <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                                  <span style={{
                                    fontSize: 9,
                                    color: isToday ? 'var(--accent)' : 'var(--text-muted)',
                                    fontWeight: isToday ? 700 : 400,
                                  }}>
                                    {DAY_LABELS[i % 7]}
                                  </span>
                                  <button
                                    onClick={() => !future && handleToggle(habit.id, week.id, d)}
                                    disabled={future}
                                    style={{
                                      width: 32, height: 32, borderRadius: 8,
                                      border: done
                                        ? 'none'
                                        : isToday
                                        ? `1.5px solid ${habit.color}`
                                        : '1.5px solid var(--border)',
                                      background: done ? habit.color : 'transparent',
                                      cursor: future ? 'not-allowed' : 'pointer',
                                      opacity: future ? 0.3 : 1,
                                      transition: 'all 0.15s',
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 13,
                                      WebkitTapHighlightColor: 'transparent',
                                    }}
                                  >
                                    {done && '✓'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{
                            marginTop: 10, height: 3, borderRadius: 2,
                            background: 'var(--border)', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: habit.color, borderRadius: 2,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // ─── DESKTOP: Table layout ──────────────────────────────────
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{
                            textAlign: 'left', paddingBottom: 12,
                            fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, width: 160,
                          }}>
                            Odat
                          </th>
                          {days.map((d, i) => {
                            const isToday = d === today;
                            return (
                              <th key={d} style={{ textAlign: 'center', paddingBottom: 12, width: 44 }}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>
                                  {DAY_LABELS[i % 7]}
                                </div>
                                <div style={{
                                  fontSize: 12, fontWeight: 600,
                                  color: isToday ? 'var(--accent)' : 'var(--text-secondary)',
                                  background: isToday ? 'var(--accent-glow)' : 'transparent',
                                  borderRadius: 6, padding: '2px 4px',
                                }}>
                                  {new Date(d).getDate()}
                                </div>
                              </th>
                            );
                          })}
                          <th style={{
                            textAlign: 'center', fontSize: 11,
                            color: 'var(--text-muted)', fontWeight: 500,
                            paddingBottom: 12, paddingLeft: 8,
                          }}>
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {wHabits.map((habit) => {
                          const completed = days.filter((d) => trackMap[`${habit.id}_${d}`]?.isCompleted).length;
                          const pct = Math.round((completed / days.length) * 100);
                          return (
                            <tr key={habit.id}>
                              <td style={{ paddingBottom: 10, paddingRight: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: habit.color, flexShrink: 0,
                                  }} />
                                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {habit.icon && `${habit.icon} `}{habit.name}
                                  </span>
                                </div>
                              </td>
                              {days.map((d) => {
                                const key = `${habit.id}_${d}`;
                                const track = trackMap[key];
                                const done = track?.isCompleted ?? false;
                                const future = d > today;
                                return (
                                  <td key={d} style={{ textAlign: 'center', paddingBottom: 10 }}>
                                    <button
                                      onClick={() => !future && handleToggle(habit.id, week.id, d)}
                                      disabled={future}
                                      title={d}
                                      style={{
                                        width: 30, height: 30, borderRadius: 8,
                                        border: done ? 'none' : '1.5px solid var(--border)',
                                        background: done ? habit.color : 'transparent',
                                        cursor: future ? 'not-allowed' : 'pointer',
                                        opacity: future ? 0.3 : 1,
                                        transition: 'all 0.15s',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12,
                                      }}
                                    >
                                      {done && '✓'}
                                    </button>
                                  </td>
                                );
                              })}
                              <td style={{ textAlign: 'center', paddingLeft: 8, paddingBottom: 10 }}>
                                <span style={{
                                  fontSize: 12, fontWeight: 600,
                                  color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--text-muted)',
                                }}>
                                  {pct}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}