import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { user, token, isAuthenticated, login, register, loginWithGoogle, logout } = useAuthStore();
  return { user, token, isAuthenticated, login, register, loginWithGoogle, logout };
}
