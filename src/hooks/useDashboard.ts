import { useState, useEffect, useCallback } from 'react';
import { DashboardItem, ToggleTrackDto, HabitTrack, HabitStats, WeekStats } from '@/src/types';
import { dashboardApi, tracksApi, statsApi, weeksApi } from '@/src/api';
import { HabitWeek, CreateWeekDto } from '@/src/types';

// ==================== DASHBOARD ====================
export function useDashboard(userId: string | undefined) {
  const [dashboard, setDashboard] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.get(userId);
      setDashboard(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
}

// ==================== TOGGLE TRACK ====================
export function useToggleTrack() {
  const [loading, setLoading] = useState(false);

  const toggle = async (dto: ToggleTrackDto): Promise<HabitTrack> => {
    setLoading(true);
    try {
      return await tracksApi.toggle(dto);
    } finally {
      setLoading(false);
    }
  };

  return { toggle, loading };
}

// ==================== WEEKS ====================
export function useWeeks() {
  const [weeks, setWeeks] = useState<HabitWeek[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weeksApi.getAll();
      setWeeks(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const createWeek = async (dto: CreateWeekDto): Promise<HabitWeek> => {
    const week = await weeksApi.create(dto);
    setWeeks((prev) => [...prev, week]);
    return week;
  };

  const deleteWeek = async (id: string): Promise<void> => {
    await weeksApi.delete(id);
    setWeeks((prev) => prev.filter((w) => w.id !== id));
  };

  return { weeks, loading, error, fetchWeeks, createWeek, deleteWeek };
}

// ==================== HABIT STATS ====================
export function useHabitStats(userId: string | undefined, habitId: string | undefined) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !habitId) return;
    setLoading(true);
    statsApi
      .getHabitStats(userId, habitId)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, habitId]);

  return { stats, loading };
}

// ==================== WEEK STATS ====================
export function useWeekStats(weekId: string | undefined) {
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!weekId) return;
    setLoading(true);
    statsApi
      .getWeekStats(weekId)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weekId]);

  return { stats, loading };
}