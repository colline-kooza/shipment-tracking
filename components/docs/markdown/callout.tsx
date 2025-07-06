// components/ui/callout.tsx
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  default: {
    base: "bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-900",
    title: "text-sky-900 dark:text-sky-100",
    content: "text-sky-800 dark:text-sky-200",
    icon: <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
  },
  info: {
    base: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900",
    title: "text-blue-900 dark:text-blue-100",
    content: "text-blue-800 dark:text-blue-200",
    icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
  },
  warning: {
    base: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900",
    title: "text-amber-900 dark:text-amber-100",
    content: "text-amber-800 dark:text-amber-200",
    icon: (
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    ),
  },
  error: {
    base: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900",
    title: "text-red-900 dark:text-red-100",
    content: "text-red-800 dark:text-red-200",
    icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
  },
  success: {
    base: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900",
    title: "text-green-900 dark:text-green-100",
    content: "text-green-800 dark:text-green-200",
    icon: (
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
    ),
  },
};

interface CalloutProps {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Callout({
  title,
  children,
  icon,
  variant = "default",
  className,
}: CalloutProps) {
  const styles = variants[variant];

  return (
    <div
      className={cn(
        "relative my-6 rounded-lg border p-4",
        styles.base,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-1">{icon || styles.icon}</div>

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h5 className={cn("font-medium leading-6", styles.title)}>
              {title}
            </h5>
          )}
          <div className={cn("text-sm", styles.content)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
