import { create } from 'zustand';
import { User } from '@reportsaathi/shared';
import { secureStorage } from '../services/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (userPartial: Partial<User>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user: User, token: string) => {
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (userPartial: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userPartial } : null,
    }));
  },

  logout: async () => {
    await secureStorage.clearToken();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

