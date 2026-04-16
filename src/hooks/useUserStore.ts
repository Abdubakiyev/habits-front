import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CreateUserDto } from '@/src/types';
import { userApi } from '@/src/api';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  register: (dto: CreateUserDto) => Promise<User>;
  login: (phone: string) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),

      register: async (dto) => {
        set({ loading: true, error: null });
        try {
          const user = await userApi.register(dto);
          set({ user, loading: false });
          return user;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Ro\'yxatdan o\'tishda xato';
          set({ error: msg, loading: false });
          throw e;
        }
      },

      login: async (phone) => {
        set({ loading: true, error: null });
        try {
          const user = await userApi.getByPhone(phone);
          if (!user) throw new Error('Foydalanuvchi topilmadi');
          set({ user, loading: false });
          return user;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Kirishda xato';
          set({ error: msg, loading: false });
          throw e;
        }
      },

      logout: () => set({ user: null }),
      clearError: () => set({ error: null }),
    }),
    { name: 'habit-user' }
  )
);