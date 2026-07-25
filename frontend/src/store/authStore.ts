import { create } from "zustand";
import { authService } from "../services/auth.service";
import type { AppUser } from "../services/types";

const TOKEN_KEY = "inupa_token";
const USER_KEY = "inupa_user";

function loadUser(): AppUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function persist(token: string, user: AppUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (correo: string, password: string) => Promise<AppUser>;
  register: (nombre: string, email: string, password: string) => Promise<AppUser>;
  loginWithGoogle: (idToken: string) => Promise<AppUser>;
  setSession: (token: string, user: AppUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

  setSession: (token, user) => {
    persist(token, user);
    set({ token, user, isAuthenticated: true });
  },

  login: async (correo, password) => {
    const { accessToken, user } = await authService.login(correo, password);
    persist(accessToken, user);
    set({ token: accessToken, user, isAuthenticated: true });
    return user;
  },

  register: async (nombre, email, password) => {
    const { accessToken, user } = await authService.register(nombre, email, password);
    persist(accessToken, user);
    set({ token: accessToken, user, isAuthenticated: true });
    return user;
  },

  loginWithGoogle: async (idToken) => {
    const { accessToken, user } = await authService.googleLogin(idToken);
    persist(accessToken, user);
    set({ token: accessToken, user, isAuthenticated: true });
    return user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
