type Variant = "default" | "secondary" | "success" | "destructive";

const variantClasses: Record<Variant, string> = {
  default:
    "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
  secondary:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  destructive:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
