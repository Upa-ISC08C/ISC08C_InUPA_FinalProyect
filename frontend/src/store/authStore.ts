import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('inupa_token'),
  isAuthenticated: !!localStorage.getItem('inupa_token'),
  setToken: (token: string) => {
    localStorage.setItem('inupa_token', token);
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('inupa_token');
    set({ token: null, isAuthenticated: false });
  },
}));
