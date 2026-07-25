import { api } from "./api";
import type { CV } from "../types/cv.types";
import type { Job } from "../types/job.types";

export const aiService = {
  matchJobs(cvId: string) {
    return api.get<Job[]>(`/ai/cv/${cvId}/matches`).then((res) => res.data);
  },

  parseCv(cvId: string) {
    return api.post<CV>(`/ai/cv/${cvId}/parse`).then((res) => res.data);
  },
};
