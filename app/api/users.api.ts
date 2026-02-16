import { request } from "./httpClient";

export type UserSummary = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
};

export const usersApi = {
  list: (token: string, onUnauthorized?: () => void) =>
    request<UserSummary[]>({
      method: "GET",
      path: "/users",
      token,
      onUnauthorized,
    }),
};
