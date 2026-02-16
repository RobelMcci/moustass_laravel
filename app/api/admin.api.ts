import { request } from "./httpClient";

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt?: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  role: "ADMIN" | "CLIENT";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

export type UpdateUserPayload = {
  role?: "ADMIN" | "CLIENT";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

export const adminApi = {
  listUsers: (token: string, onUnauthorized?: () => void) =>
    request<AdminUser[]>({
      method: "GET",
      path: "/admin/users",
      token,
      onUnauthorized,
    }),
  createUser: (
    token: string,
    payload: CreateUserPayload,
    onUnauthorized?: () => void,
  ) =>
    request<AdminUser>({
      method: "POST",
      path: "/admin/users",
      token,
      body: payload,
      onUnauthorized,
    }),
  updateUser: (
    token: string,
    id: string,
    payload: UpdateUserPayload,
    onUnauthorized?: () => void,
  ) =>
    request<AdminUser>({
      method: "PUT",
      path: `/admin/users/${id}`,
      token,
      body: payload,
      onUnauthorized,
    }),
  deleteUser: (token: string, id: string, onUnauthorized?: () => void) =>
    request<void>({
      method: "DELETE",
      path: `/admin/users/${id}`,
      token,
      onUnauthorized,
    }),
  startIncrementalBackup: (token: string, onUnauthorized?: () => void) =>
    request<void>({
      method: "POST",
      path: "/admin/backups/incremental",
      token,
      onUnauthorized,
    }),
  restoreBackup: (token: string, onUnauthorized?: () => void) =>
    request<void>({
      method: "POST",
      path: "/admin/backups/restore",
      token,
      onUnauthorized,
    }),
  backupHistory: (token: string, onUnauthorized?: () => void) =>
    request<Array<{ id: string; createdAt: string; status?: string }>>({
      method: "GET",
      path: "/admin/backups/history",
      token,
      onUnauthorized,
    }),
};
