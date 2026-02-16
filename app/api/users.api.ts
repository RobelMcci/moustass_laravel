import { request } from "./httpClient";

export type UserSummary = {
  id: string;
  email: string;
};

type UsersResponse = {
  users: Array<{
    id: string | number;
    email: string;
  }>;
};

export const usersApi = {
  list: (token: string, onUnauthorized?: () => void) =>
    request<UsersResponse>({
      method: "GET",
      path: "/users",
      token,
      onUnauthorized,
    }).then((response) =>
      response.users.map((user) => ({
        id: String(user.id),
        email: user.email,
      })),
    ),
};
