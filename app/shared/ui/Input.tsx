import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  const hasError = Boolean(error);
  
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
      <input
        className={`w-full rounded-xl border px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:ring-2 dark:text-gray-100 ${
          hasError
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-800 dark:bg-red-950/30 dark:focus:ring-red-900"
            : "border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-800 dark:bg-gray-950 dark:focus:border-blue-600 dark:focus:ring-blue-900"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}
