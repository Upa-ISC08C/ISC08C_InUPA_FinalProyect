import { api } from "./api";
import type { Company } from "./types";

export type { Company };

export const companiesService = {
  list() {
    return api.get<{ success: boolean; data: Company[] }>("/companies").then((res) => res.data.data);
  },
  create(data: Partial<Company>) {
    return api.post<{ success: boolean; data: Company }>("/companies", data).then((res) => res.data.data);
  },
  update(id: string, data: Partial<Company>) {
    return api.put<{ success: boolean; data: Company }>(`/companies/${id}`, data).then((res) => res.data.data);
  },
  remove(id: string) {
    return api.delete(`/companies/${id}`).then((res) => res.data);
  },
};
