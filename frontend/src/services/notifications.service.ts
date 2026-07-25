import { api } from "./api";

export const notificationsService = {
  list() {
    return api
      .get<{ success: boolean; notificaciones: any[]; noLeidas: number }>("/notifications")
      .then((r) => r.data);
  },
  markRead(id: string) {
    return api.patch(`/notifications/${id}/read`).then((r) => r.data);
  },
  markAllRead() {
    return api.patch("/notifications/read-all").then((r) => r.data);
  },
};
