import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconSize?: number;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-[11px] sm:text-xs gap-1 sm:gap-1.5",
  md: "px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm gap-1.5 sm:gap-2",
  lg: "px-3.5 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-base gap-2 sm:gap-2.5",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "size-3 sm:size-3.5 shrink-0",
  md: "size-3.5 sm:size-4 shrink-0",
  lg: "size-4 sm:size-4.5 shrink-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      type = "button",
      className,
      disabled = false,
      isLoading = false,
      children,
      icon: Icon,
      iconPosition = "left",
      iconSize,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "btn inline-flex items-center justify-center font-medium transition-all duration-200 select-none active:scale-[0.98] whitespace-nowrap shrink-0 rounded-full",
          `btn-${variant}`,
          sizeClasses[size],
          (disabled || isLoading) &&
            "pointer-events-none cursor-not-allowed opacity-60",
          className,
        )}
        onClick={onClick}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className={cn(iconSizeClasses[size], "animate-spin text-current")}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {Icon && iconPosition === "left" && (
              <Icon
                {...(iconSize !== undefined ? { size: iconSize } : {})}
                className={cn(iconSizeClasses[size])}
              />
            )}

            {children && <span>{children}</span>}

            {Icon && iconPosition === "right" && (
              <Icon
                {...(iconSize !== undefined ? { size: iconSize } : {})}
                className={cn(iconSizeClasses[size])}
              />
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
