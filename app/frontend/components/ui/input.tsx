import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  error?: string;
}

export function Input({ label, unit, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
            "text-gray-900 placeholder:text-gray-400",
            "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            "disabled:opacity-50",
            unit && "pr-10",
            error && "border-red-400",
            className
          )}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 text-xs text-gray-400">{unit}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
