import { request } from "./httpClient";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type MeResponse = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>({ method: "POST", path: "/auth/login", body: payload }),
  register: (payload: RegisterPayload) =>
    request<void>({ method: "POST", path: "/auth/register", body: payload }),
  me: (token: string, onUnauthorized?: () => void) =>
    request<MeResponse>({
      method: "GET",
      path: "/auth/me",
      token,
      onUnauthorized,
    }),
};
