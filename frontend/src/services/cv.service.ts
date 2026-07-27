import { api } from "./api";
import type { CV } from "../types/cv.types";

export const cvService = {
  getMine() {
    return api.get<CV>("/cv/me").then((res) => res.data);
  },

  save(payload: Partial<CV>) {
    return api.put<CV>("/cv/me", payload).then((res) => res.data);
  },

  downloadPdf(cvId: string) {
    return api
      .get(`/cv/${cvId}/pdf`, { responseType: "blob" })
      .then((res) => res.data as Blob);
  },
};
