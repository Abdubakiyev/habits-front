// ==================== USER ====================
export interface User {
  id: string;
  name: string;
  phone: string;
  habits: Habit[];
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  phone: string;
}

// ==================== HABIT ====================
export interface Habit {
  id: string;
  name: string;
  userId: string;
  color: string;
  icon: string | null;
  isActive: boolean;
  tracks: HabitTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitDto {
  name: string;
  userId: string;
  color?: string;
  icon?: string;
}

export interface UpdateHabitDto {
  name?: string;
  color?: string;
  icon?: string;
}

// ==================== WEEK ====================
export interface HabitWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tracks: HabitTrack[];
  createdAt: string;
}

export interface CreateWeekDto {
  weekNumber: number;
  startDate: string;
  endDate: string;
}

// ==================== TRACK ====================
export interface HabitTrack {
  id: string;
  habitId: string;
  weekId: string;
  trackDate: string;
  isCompleted: boolean;
  notes: string | null;
  habit?: Habit;
  week?: HabitWeek;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleTrackDto {
  habitId: string;
  weekId: string;
  trackDate: string;
  isCompleted: boolean;
  notes?: string;
}

// ==================== DASHBOARD ====================
export interface DashboardItem {
  week: HabitWeek;
  habits: (Habit & { tracks: HabitTrack[] })[];
}

// ==================== STATS ====================
export interface HabitStats {
  habit: Habit;
  totalDays: number;
  completedDays: number;
  missedDays: number;
  completionRate: string;
}

export interface WeekStats {
  week: HabitWeek;
  totalTracks: number;
  completedTracks: number;
  missedTracks: number;
  completionRate: string;
}

// ==================== API RESPONSE ====================
export interface ApiError {
  message: string;
  statusCode: number;
}

export const HABIT_ICONS = [
  '🏃', '💪', '📚', '🧘', '💧', '🍎', '😴', '✍️',
  '🎯', '🎨', '🎵', '🧹', '💊', '🌿', '🧠', '❤️',
];

export const HABIT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
];