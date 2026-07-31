export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  career?: string;
  semester?: number;
  createdAt: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  career?: string;
  semester?: number;
  avatarUrl?: string;
}
