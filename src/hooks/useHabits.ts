import { useState, useEffect, useCallback } from 'react';
import { Habit, CreateHabitDto, UpdateHabitDto } from '@/src/types';
import { habitsApi } from '@/src/api';

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await habitsApi.getAll(userId);
      setHabits(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = async (dto: CreateHabitDto): Promise<Habit> => {
    const habit = await habitsApi.create(dto);
    setHabits((prev) => [habit, ...prev]);
    return habit;
  };

  const updateHabit = async (
    id: string,
    dto: UpdateHabitDto
  ): Promise<Habit> => {
    if (!userId) throw new Error('User not found');
    const updated = await habitsApi.update(userId, id, dto);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    return updated;
  };

  const deleteHabit = async (id: string): Promise<void> => {
    if (!userId) throw new Error('User not found');
    await habitsApi.delete(userId, id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
  };
}