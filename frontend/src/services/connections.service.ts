import { api } from "./api";

export const connectionsService = {
  list(follower_id?: string) {
    const params = follower_id ? { follower_id } : {};
    return api.get<{ success: boolean; data: any[] }>("/connections", { params }).then((r) => r.data.data);
  },
  create(data: { follower_id: string; following_id: string }) {
    return api.post("/connections", data).then((r) => r.data.data);
  },
  remove(id: string) {
    return api.delete(`/connections/${id}`).then((r) => r.data);
  },
};
