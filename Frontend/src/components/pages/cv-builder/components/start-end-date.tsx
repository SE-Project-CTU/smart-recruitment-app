import { cn } from "@/lib/utils";
import type { CVFieldStyle } from "@/types/cv";
import { getFieldStyle } from "../templates/ModernTwoColumn/utils";

interface StartEndDateProps {
  className?: string;
  fields?: Record<string, CVFieldStyle>;
  itemId: string;
  start: string | null;
  end: string | null;
}

function StartEndDate({
  className,
  fields,
  itemId,
  start,
  end,
}: StartEndDateProps) {
  if (!start && !end) return null;

  return (
    <div className={cn("flex items-center gap-1 text-slate-600", className)}>
      <span
        className="font-normal"
        style={getFieldStyle(fields, `${itemId}.start`, {
          color: "#64748B",
        })}
      >
        {start}
      </span>
      -
      <span
        className="font-normal"
        style={getFieldStyle(fields, `${itemId}.end`, {
          color: "#64748B",
        })}
      >
        {end}
      </span>
    </div>
  );
}

export default StartEndDate;
