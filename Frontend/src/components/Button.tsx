import { clsx } from "clsx";

interface ButtonProps {
  type?: "primary" | "secondary" | "outline";
  text: string;
  className?: string;
  onClick?: () => void;
}

function Button({ type = "primary", text, onClick, className }: ButtonProps) {
  return (
    <button className={clsx("btn", `btn-${type}`, className)} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
