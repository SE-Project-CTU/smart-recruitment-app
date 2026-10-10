import { clsx } from "clsx";
import type { ReactNode } from "react";

interface ButtonProps {
  type?: "primary" | "secondary" | "outline";
  htmlType?: "button" | "submit" | "reset";
  text?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
}

function Button({
  type = "primary",
  htmlType,
  text,
  onClick,
  className,
  disabled = false,
  isLoading = false,
  children,
}: ButtonProps) {
  return (
    <button
      type={htmlType}
      disabled={disabled || isLoading}
      className={clsx(
        "btn",
        `btn-${type}`,
        (disabled || isLoading) && "opacity-60 cursor-not-allowed pointer-events-none",
        className,
      )}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-current"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{text || children || "Đang xử lý..."}</span>
        </span>
      ) : (
        children || text
      )}
    </button>
  );
}

export default Button;
