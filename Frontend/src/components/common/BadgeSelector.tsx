import { AlertCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export interface BadgeSelectorProps<T extends string = string> {
  options: BadgeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function BadgeSelector<T extends string = string>({
  options,
  value,
  onChange,
  label,
  required,
  error,
  disabled = false,
  className,
  size = "md",
}: BadgeSelectorProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-text-main">
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border transition-all duration-150 select-none",
                size === "sm"
                  ? "px-2.5 py-1 text-[11px]"
                  : "px-3.5 py-2 text-xs",
                isSelected
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                  : "border-border bg-bg text-text-muted hover:border-slate-300 hover:bg-surface hover:text-text-main font-medium",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "shrink-0",
                    size === "sm" ? "size-3.5" : "size-4",
                    isSelected ? "text-primary" : "text-text-muted",
                  )}
                />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-5 text-[11px] leading-tight text-status-error">
        {error && (
          <span className="flex items-center gap-1 animate-in fade-in duration-150">
            <AlertCircle className="size-3 shrink-0" />
            <span>{error}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default BadgeSelector;
