import {
  User,
  CreateUserDto,
  Habit,
  CreateHabitDto,
  UpdateHabitDto,
  HabitWeek,
  CreateWeekDto,
  HabitTrack,
  ToggleTrackDto,
  DashboardItem,
  HabitStats,
  WeekStats,
} from '@/src/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://habits-backend-m913.onrender.com/api';

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Xato yuz berdi' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ==================== USERS ====================
export const userApi = {
  register: (dto: CreateUserDto): Promise<User> =>
    request('/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // 🔥 SHART
      },
      body: JSON.stringify(dto),
    }),

  getByPhone: (phone: string): Promise<User> =>
    request(`/users/${encodeURIComponent(phone)}`),
};

// ==================== HABITS ====================
export const habitsApi = {
  create: (dto: CreateHabitDto): Promise<Habit> =>
    request('/habits', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getAll: (userId: string): Promise<Habit[]> =>
    request(`/habits/all/${userId}`),

  getOne: (userId: string, id: string): Promise<Habit> =>
    request(`/habits/one/${userId}/${id}`),

  update: (userId: string, id: string, dto: UpdateHabitDto): Promise<Habit> =>
    request(`/habits/${userId}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (userId: string, id: string): Promise<void> =>
    request(`/habits/${userId}/${id}`, { method: 'DELETE' }),
};

// ==================== WEEKS ====================
export const weeksApi = {
  create: (dto: CreateWeekDto): Promise<HabitWeek> =>
    request('/habits/weeks', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getAll: (): Promise<HabitWeek[]> => request('/habits/weeks'),

  getOne: (id: string): Promise<HabitWeek> => request(`/habits/weeks/${id}`),

  delete: (id: string): Promise<void> =>
    request(`/habits/weeks/${id}`, { method: 'DELETE' }),
};

// ==================== TRACKS ====================
export const tracksApi = {
  toggle: (dto: ToggleTrackDto): Promise<HabitTrack> =>
    request('/habits/tracks/toggle', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getByHabit: (habitId: string): Promise<HabitTrack[]> =>
    request(`/habits/tracks/habit/${habitId}`),

  getByWeek: (weekId: string): Promise<HabitTrack[]> =>
    request(`/habits/tracks/week/${weekId}`),
};

// ==================== DASHBOARD ====================
export const dashboardApi = {
  get: (userId: string): Promise<DashboardItem[]> =>
    request(`/habits/dashboard/${userId}`),
};

// ==================== STATS ====================
export const statsApi = {
  getHabitStats: (userId: string, habitId: string): Promise<HabitStats> =>
    request(`/habits/stats/habit/${userId}/${habitId}`),

  getWeekStats: (weekId: string): Promise<WeekStats> =>
    request(`/habits/stats/week/${weekId}`),
};