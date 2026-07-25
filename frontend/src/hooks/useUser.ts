import { useUserStore } from "../store/userStore";

export function useUser() {
  const { profile, status, error, fetchProfile, updateProfile } = useUserStore();
  return { profile, status, error, fetchProfile, updateProfile };
}
