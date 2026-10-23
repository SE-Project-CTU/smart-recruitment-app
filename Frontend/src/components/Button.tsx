import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconSize?: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      type = "button",
      className,
      disabled = false,
      isLoading = false,
      children,
      icon: Icon,
      iconPosition = "left",
      iconSize = 18,
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
        className={clsx(
          "btn inline-flex items-center justify-center gap-2 transition-all duration-200",
          `btn-${variant}`,
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
              className="h-4 w-4 shrink-0 animate-spin text-current"
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
              <Icon size={iconSize} className="shrink-0" />
            )}

            {children && <span>{children}</span>}

            {Icon && iconPosition === "right" && (
              <Icon size={iconSize} className="shrink-0" />
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
