import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./useAuth";

type ProtectedRouteProps = {
  allowedRoles: Array<"ADMIN" | "CLIENT">;
  redirectTo?: string;
  children: ReactNode;
};

export function ProtectedRoute({
  allowedRoles,
  redirectTo,
  children,
}: ProtectedRouteProps) {
  const { token, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  if (!token || !role) {
    return <Navigate to={redirectTo ?? "/login"} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
