export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type HttpRequestOptions = {
  method: HttpMethod;
  path: string;
  token?: string | null;
  body?: unknown;
  onUnauthorized?: () => void;
};

export type ApiError = {
  status: number;
  message: string;
};

const BASE_URL = "https://www.moustass.com";

export async function request<T>({
  method,
  path,
  token,
  body,
  onUnauthorized,
}: HttpRequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    let message = "Erreur serveur.";
    try {
      const data = await response.json();
      if (typeof data?.message === "string") {
        message = data.message;
      } else if (data?.errors && typeof data.errors === "object") {
        const details = Object.values(data.errors)
          .flat()
          .filter((item) => typeof item === "string");
        if (details.length > 0) {
          message = details.join(" ");
        }
      }
    } catch {
      // ignore parsing errors
    }
    const error: ApiError = { status: response.status, message };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
