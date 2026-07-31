import { create } from "zustand";
import { cvService } from "../services/cv.service";
import type { CV } from "../types/cv.types";

interface CVState {
  current: CV | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  fetchMyCv: () => Promise<void>;
  saveCv: (payload: Partial<CV>) => Promise<void>;
}

export const useCvStore = create<CVState>((set) => ({
  current: null,
  status: "idle",
  error: null,

  fetchMyCv: async () => {
    set({ status: "loading" });
    try {
      const current = await cvService.getMine();
      set({ status: "succeeded", current });
    } catch {
      set({ status: "failed", error: "No se pudo cargar el CV" });
    }
  },

  saveCv: async (payload) => {
    const current = await cvService.save(payload);
    set({ current });
  },
}));
