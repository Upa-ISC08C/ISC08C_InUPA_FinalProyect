import { create } from "zustand";
import { userService } from "../services/user.service";
import type { UpdateUserPayload, User } from "../types/user.types";

interface UserState {
  profile: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: UpdateUserPayload) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  status: "idle",
  error: null,

  fetchProfile: async () => {
    set({ status: "loading" });
    try {
      const profile = await userService.me();
      set({ status: "succeeded", profile });
    } catch {
      set({ status: "failed", error: "No se pudo cargar el perfil" });
    }
  },

  updateProfile: async (payload) => {
    const profile = await userService.updateMe(payload);
    set({ profile });
  },
}));
