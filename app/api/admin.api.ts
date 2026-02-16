import { request } from "./httpClient";

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  status: "active" | "disabled";
  createdAt?: string;
};

type AdminUsersResponse = {
  users: Array<{
    id: string | number;
    email: string;
    role: "ADMIN" | "CLIENT";
    status: "active" | "disabled";
    created_at?: string | null;
  }>;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  role: "ADMIN" | "CLIENT";
  status?: "active" | "disabled";
};

export type UpdateUserPayload = {
  role?: "ADMIN" | "CLIENT";
  status?: "active" | "disabled";
};

type BackupHistoryResponse = {
  history: Array<{
    id: string | number;
    created_at?: string | null;
    status?: string | null;
  }>;
};

const mapAdminUser = (user: AdminUsersResponse["users"][number]): AdminUser => ({
  id: String(user.id),
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.created_at ?? undefined,
});

export const adminApi = {
  listUsers: (token: string, onUnauthorized?: () => void) =>
    request<AdminUsersResponse>({
      method: "GET",
      path: "/admin/users",
      token,
      onUnauthorized,
    }).then((response) => response.users.map(mapAdminUser)),
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
    request<BackupHistoryResponse>({
      method: "GET",
      path: "/admin/backups/history",
      token,
      onUnauthorized,
    }).then((response) =>
      response.history.map((item) => ({
        id: String(item.id),
        createdAt: item.created_at ?? "",
        status: item.status ?? undefined,
      })),
    ),
};
