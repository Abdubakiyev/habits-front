'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/src/hooks/useUserStore';
import { useHabits } from '@/src/hooks/useHabits';
import { HABIT_COLORS, HABIT_ICONS, Habit, CreateHabitDto, UpdateHabitDto } from '@/src/types';
import Sidebar from '@/src/components/Sidebar';

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

function HabitModal({
  habit,
  userId,
  onClose,
  onSave,
}: {
  habit?: Habit;
  userId: string;
  onClose: () => void;
  onSave: (data: CreateHabitDto | UpdateHabitDto) => Promise<void>;
}) {
  const isMobile = useIsMobile();
  const [name, setName] = useState(habit?.name ?? '');
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState(habit?.icon ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return setError('Odat nomini kiriting');
    setLoading(true);
    setError('');
    try {
      await onSave({ name: name.trim(), color, icon: icon || undefined, userId });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Xato');
    } finally {
      setLoading(false);
    }
  };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }
    : {
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      };

  const cardStyle: React.CSSProperties = isMobile
    ? {
        width: '100%', padding: '24px 20px 36px',
        borderRadius: '20px 20px 0 0',
        maxHeight: '90vh', overflowY: 'auto',
      }
    : {
        width: '100%', maxWidth: 420, padding: 28,
        borderRadius: 16,
      };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div
        className="card animate-fadeUp"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--border)', margin: '0 auto 20px',
          }} />
        )}

        <h2 className="font-display" style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, marginBottom: 20 }}>
          {habit ? 'Odatni tahrirlash' : "Yangi odat qo'shish"}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Odat nomi</label>
            <input
              className="input"
              placeholder="Har kuni yugurish"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!isMobile}
              style={{ fontSize: isMobile ? 16 : 14 }}
            />
          </div>

          <div>
            <label className="label">Icon tanlang</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 10 : 8 }}>
              {HABIT_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic === icon ? '' : ic)}
                  style={{
                    width: isMobile ? 44 : 38,
                    height: isMobile ? 44 : 38,
                    borderRadius: 10,
                    border: icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: icon === ic ? 'var(--accent-glow)' : 'var(--bg-card-2)',
                    cursor: 'pointer', fontSize: isMobile ? 20 : 18,
                    transition: 'all 0.15s',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Rang tanlang</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 12 : 8 }}>
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: isMobile ? 36 : 32,
                    height: isMobile ? 36 : 32,
                    borderRadius: '50%',
                    background: c, border: 'none', cursor: 'pointer',
                    boxShadow: color === c ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${c}` : 'none',
                    transition: 'all 0.15s',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10,
            background: 'var(--bg-card-2)', border: '1px solid var(--border)',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 14 }}>
              {icon && `${icon} `}{name || 'Odat nomi'}
            </span>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)' }}>⚠️ {error}</p>
          )}

          <div style={{
            display: 'flex', gap: 10,
            justifyContent: isMobile ? 'stretch' : 'flex-end',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            marginTop: 4,
          }}>
            <button
              className="btn btn-ghost"
              onClick={onClose}
              style={isMobile ? { width: '100%', padding: '13px' } : {}}
            >
              Bekor
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
              style={isMobile ? { width: '100%', padding: '13px' } : {}}
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const { user } = useUserStore();
  const { habits, loading, error, createHabit, updateHabit, deleteHabit } = useHabits(user?.id);
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const isMobile = useIsMobile();

  if (!user) return null;

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
                Odatlar
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
                {habits.length} ta faol odat
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setEditHabit(undefined); setShowModal(true); }}
              style={{
                padding: isMobile ? '10px 16px' : '10px 18px',
                fontSize: isMobile ? 13 : 14,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + Yangi odat
            </button>
          </div>

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

          {!loading && habits.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: isMobile ? 40 : 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
              <h3 className="font-display" style={{ fontSize: isMobile ? 18 : 20, marginBottom: 8 }}>
                Hali odat yo'q
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                Birinchi odatingizni qo'shing va kuzatishni boshlang
              </p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Odat yaratish
              </button>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: isMobile ? 12 : 16,
          }}>
            {habits.map((habit, i) => {
              const tracks = habit.tracks ?? [];
              const completedCount = tracks.filter((t) => t.isCompleted).length;
              const totalCount = tracks.length;

              return (
                <div
                  key={habit.id}
                  className="card animate-fadeUp"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    position: 'relative',
                    overflow: 'hidden',
                    padding: isMobile ? '16px 14px' : undefined,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: habit.color,
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: isMobile ? 44 : 40,
                        height: isMobile ? 44 : 40,
                        borderRadius: 12, flexShrink: 0,
                        background: `${habit.color}20`,
                        border: `1px solid ${habit.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: habit.icon ? (isMobile ? 22 : 20) : (isMobile ? 15 : 14),
                        color: habit.color, fontWeight: 700,
                      }}>
                        {habit.icon || habit.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {habit.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(habit.createdAt).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginLeft: 8, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost"
                        style={{
                          padding: isMobile ? '8px 12px' : '6px 10px',
                          fontSize: 13,
                          minWidth: isMobile ? 38 : undefined,
                          minHeight: isMobile ? 38 : undefined,
                        }}
                        onClick={() => { setEditHabit(habit); setShowModal(true); }}
                      >
                        ✎
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{
                          padding: isMobile ? '8px 12px' : '6px 10px',
                          fontSize: 13,
                          minWidth: isMobile ? 38 : undefined,
                          minHeight: isMobile ? 38 : undefined,
                        }}
                        onClick={() => setConfirmDelete(habit.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 14, paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                    display: 'flex', gap: 16,
                  }}>
                    <div>
                      <div style={{
                        fontSize: 18, fontWeight: 700,
                        color: 'var(--success)', fontFamily: 'var(--font-display)',
                      }}>
                        {completedCount}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bajarildi</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 18, fontWeight: 700,
                        color: 'var(--text-secondary)', fontFamily: 'var(--font-display)',
                      }}>
                        {totalCount}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jami</div>
                    </div>
                    {totalCount > 0 && (
                      <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: completedCount === totalCount ? 'var(--success)' : 'var(--text-muted)',
                        }}>
                          {Math.round((completedCount / totalCount) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {totalCount > 0 && (
                    <div style={{
                      marginTop: 8, height: 3, borderRadius: 2,
                      background: 'var(--border)', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round((completedCount / totalCount) * 100)}%`,
                        background: habit.color,
                        borderRadius: 2,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showModal && (
            <HabitModal
              habit={editHabit}
              userId={user.id}
              onClose={() => setShowModal(false)}
              onSave={async (data) => {
                if (editHabit) await updateHabit(editHabit.id, data as UpdateHabitDto);
                else await createHabit(data as CreateHabitDto);
              }}
            />
          )}

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
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <h3 className="font-display" style={{ fontSize: 18, marginBottom: 8 }}>Odatni o'chirish</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                  Bu amal odatni nofaol qiladi. Davom etasizmi?
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
                      await deleteHabit(confirmDelete);
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