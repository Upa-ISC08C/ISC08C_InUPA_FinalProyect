import { create } from "zustand";
import { jobsService } from "../services/jobs.service";
import type { Job, JobApplication, JobFilters } from "../types/job.types";

interface JobsState {
  items: Job[];
  applications: JobApplication[];
  filters: JobFilters;
  status: "idle" | "loading" | "succeeded" | "failed";
  applicationsStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  setFilters: (filters: JobFilters) => void;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  applyToJob: (jobId: string) => Promise<void>;
  fetchMyApplications: () => Promise<void>;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  items: [],
  applications: [],
  filters: {},
  status: "idle",
  applicationsStatus: "idle",
  error: null,

  setFilters: (filters) => set({ filters }),

  fetchJobs: async (filters) => {
    const activeFilters = filters ?? get().filters;
    set({ status: "loading", filters: activeFilters });
    try {
      const res = await jobsService.list(activeFilters);
      set({ status: "succeeded", items: res.data });
    } catch {
      set({ status: "failed", error: "No se pudieron cargar las vacantes" });
    }
  },

  applyToJob: async (jobId) => {
    const application = await jobsService.apply(jobId);
    set({ applications: [...get().applications, application] });
  },

  fetchMyApplications: async () => {
    set({ applicationsStatus: "loading" });
    try {
      const applications = await jobsService.myApplications();
      set({ applicationsStatus: "succeeded", applications });
    } catch {
      set({ applicationsStatus: "failed", error: "No se pudieron cargar tus postulaciones" });
    }
  },
}));
