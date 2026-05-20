import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning" | "secondary";
}

const variants = {
  default:   "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  success:   "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  danger:    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  warning:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  secondary: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
