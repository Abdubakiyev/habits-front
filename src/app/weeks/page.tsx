'use client';

import { useState, useEffect } from 'react';
import { useWeeks } from '@/src/hooks/useDashboard';
import { CreateWeekDto } from '@/src/types';
import Sidebar from '@/src/components/Sidebar';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // FIX: < 640 ga o'zgartirildi (WeeksPage da < 1024 edi — boshqa sahifalar bilan nomuvofiq)
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function WeeksPage() {
  const { weeks, loading, error, createWeek, deleteWeek } = useWeeks();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekNum, setWeekNum] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const isMobile = useIsMobile();

  const fillCurrentWeek = () => {
    const now = new Date();
    const monday = getMondayOfWeek(now);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setStartDate(monday.toISOString().split('T')[0]);
    setEndDate(sunday.toISOString().split('T')[0]);
    setWeekNum(String(getWeekNumber(now)));
  };

  const handleCreate = async () => {
    if (!startDate || !endDate || !weekNum) return setFormError("Barcha maydonlarni to'ldiring");
    setSaving(true);
    setFormError('');
    try {
      const dto: CreateWeekDto = {
        weekNumber: parseInt(weekNum),
        startDate,
        endDate,
      };
      await createWeek(dto);
      setShowForm(false);
      setStartDate('');
      setEndDate('');
      setWeekNum('');
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Xato');
    } finally {
      setSaving(false);
    }
  };

  return (
    // FIX: marginLeft olib tashlandi — Sidebar flex ichida o'z kengligini egallaydi
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{
        flex: 1,
        minWidth: 0, // FIX: flex child overflow oldini olish
        padding: isMobile ? '16px 16px 80px' : '32px 28px', // FIX: paddingBottom mobile uchun shu yerda
        overflowY: 'auto',
      }}>
        <div className="animate-fadeUp">
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? 20 : 28,
            gap: 12,
          }}>
            <div>
              <h1 className="font-display" style={{
                fontSize: isMobile ? 24 : 28,
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}>
                Haftalar
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
                {weeks.length} ta hafta
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setShowForm(!showForm); fillCurrentWeek(); }}
              style={{
                fontSize: isMobile ? 13 : 14,
                padding: isMobile ? '10px 16px' : undefined,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + Hafta qo'shish
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="card animate-fadeUp" style={{ marginBottom: isMobile ? 14 : 20, padding: isMobile ? 18 : 24 }}>
              <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                Yangi hafta
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                gap: isMobile ? 12 : 16,
                marginBottom: 14,
              }}>
                <div>
                  <label className="label">Hafta raqami</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={53}
                    value={weekNum}
                    onChange={(e) => setWeekNum(e.target.value)}
                    placeholder="1"
                    style={{ fontSize: isMobile ? 16 : 14 }}
                  />
                </div>
                <div>
                  <label className="label">Boshlanish</label>
                  <input
                    className="input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ fontSize: isMobile ? 16 : 14 }}
                  />
                </div>
                <div>
                  <label className="label">Tugash</label>
                  <input
                    className="input"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ fontSize: isMobile ? 16 : 14 }}
                  />
                </div>
              </div>

              {formError && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠️ {formError}</p>
              )}

              <div style={{
                display: 'flex',
                gap: 8,
                flexDirection: isMobile ? 'column-reverse' : 'row',
              }}>
                <button
                  className="btn btn-ghost"
                  onClick={fillCurrentWeek}
                  style={isMobile ? { width: '100%', padding: '12px' } : {}}
                >
                  Bu hafta
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                  style={isMobile ? { width: '100%', padding: '12px' } : {}}
                >
                  Bekor
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreate}
                  disabled={saving}
                  style={isMobile ? { width: '100%', padding: '12px' } : {}}
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(255,79,110,0.1)', border: '1px solid rgba(255,79,110,0.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 16,
              fontSize: 13, color: 'var(--danger)',
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          )}

          {!loading && weeks.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: isMobile ? 40 : 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>◫</div>
              <h3 className="font-display" style={{ fontSize: isMobile ? 18 : 20, marginBottom: 8 }}>
                Haftalar yo'q
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                Birinchi haftangizni qo'shing
              </p>
              <button
                className="btn btn-primary"
                onClick={() => { setShowForm(true); fillCurrentWeek(); }}
              >
                + Hafta qo'shish
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
            {weeks.map((week, i) => {
              const start = new Date(week.startDate);
              const end = new Date(week.endDate);
              const now = new Date();
              const isCurrent = now >= start && now <= end;

              return (
                <div
                  key={week.id}
                  className="card animate-fadeUp"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    animationDelay: `${i * 0.04}s`,
                    borderColor: isCurrent ? 'var(--accent)' : undefined,
                    padding: isMobile ? '14px 14px' : undefined,
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: isMobile ? 40 : 44,
                      height: isMobile ? 40 : 44,
                      borderRadius: 12, flexShrink: 0,
                      background: isCurrent ? 'var(--accent-glow)' : 'var(--bg-card-2)',
                      border: `1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: isMobile ? 13 : 15,
                      color: isCurrent ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {week.weekNumber}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: isMobile ? 14 : 15,
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8,
                        flexWrap: 'wrap',
                      }}>
                        {week.weekNumber}-hafta
                        {isCurrent && (
                          <span className="badge" style={{
                            background: 'var(--accent-glow)',
                            color: 'var(--accent)',
                            fontSize: 10,
                            padding: '2px 7px',
                            borderRadius: 6,
                          }}>
                            Joriy
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        {start.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })} —{' '}
                        {end.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger"
                    style={{
                      padding: isMobile ? '9px 13px' : '7px 12px',
                      fontSize: 13,
                      flexShrink: 0,
                      minWidth: isMobile ? 40 : undefined,
                      minHeight: isMobile ? 40 : undefined,
                    }}
                    onClick={() => setConfirmDelete(week.id)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Confirm delete modal */}
          {confirmDelete && (
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: isMobile ? 'flex-end' : 'center',
                justifyContent: 'center',
                padding: isMobile ? 0 : 24,
              }}
              onClick={() => setConfirmDelete(null)}
            >
              <div
                className="card animate-fadeUp"
                style={{
                  maxWidth: isMobile ? '100%' : 360,
                  width: '100%',
                  padding: isMobile ? '28px 24px 40px' : 28,
                  textAlign: 'center',
                  borderRadius: isMobile ? '20px 20px 0 0' : undefined,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {isMobile && (
                  <div style={{
                    width: 36, height: 4, borderRadius: 2,
                    background: 'var(--border)', margin: '0 auto 20px',
                  }} />
                )}
                <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
                <h3 className="font-display" style={{ fontSize: 18, marginBottom: 8 }}>Haftani o'chirish</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                  Bu hafta va barcha kuzatuvlar o'chiriladi.
                </p>
                <div style={{
                  display: 'flex', gap: 10,
                  justifyContent: 'center',
                  flexDirection: isMobile ? 'column-reverse' : 'row',
                }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setConfirmDelete(null)}
                    style={isMobile ? { width: '100%', padding: '13px' } : {}}
                  >
                    Bekor
                  </button>
                  <button
                    className="btn btn-danger"
                    style={isMobile ? { width: '100%', padding: '13px' } : {}}
                    onClick={async () => {
                      await deleteWeek(confirmDelete);
                      setConfirmDelete(null);
                    }}
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}