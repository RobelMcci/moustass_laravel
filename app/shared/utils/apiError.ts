import type { ApiError } from "../../api/httpClient";

export function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Une erreur est survenue.";
  }

  const apiError = error as ApiError;

  if (apiError.status === 401) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  if (apiError.status === 403) {
    return "Accès refusé.";
  }
  if (apiError.status >= 500) {
    return "Erreur serveur. Réessayez plus tard.";
  }
  if (apiError.message) {
    return apiError.message;
  }
  return "Une erreur est survenue.";
}
