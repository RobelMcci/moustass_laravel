import type { ReactNode } from "react";

export function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-6 shadow-md transition-shadow hover:shadow-lg backdrop-blur-sm">
      {title ? (
        <div className="mb-5 flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  );
}
