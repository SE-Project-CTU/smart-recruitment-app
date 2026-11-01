import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { vi } from "date-fns/locale/vi";
import { Popover } from "@animate-ui/react/primitives/base-ui/popover";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

export interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (dateStr: string, date?: Date) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Chọn ngày",
  disabled = false,
  error = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse value to Date
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = dayjs(value);
    return d.isValid() ? d.toDate() : undefined;
  }, [value]);

  // Formatted display text (e.g. "31 tháng 12, 2026")
  const displayText = React.useMemo(() => {
    if (!parsedDate) return null;
    return dayjs(parsedDate).format("D [tháng] M, YYYY");
  }, [parsedDate]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const formatted = dayjs(date).format("YYYY-MM-DD");
    onChange?.(formatted, date);
    setOpen(false);
  };

  // Disabled matcher for past dates or min/max bounds
  const disabledMatcher = React.useCallback(
    (date: Date) => {
      const target = dayjs(date).startOf("day");
      if (minDate) {
        const min = dayjs(minDate).startOf("day");
        if (target.isBefore(min)) return true;
      }
      if (maxDate) {
        const max = dayjs(maxDate).startOf("day");
        if (target.isAfter(max)) return true;
      }
      return false;
    },
    [minDate, maxDate],
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        type="button"
        disabled={disabled}
        aria-label={displayText || placeholder}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-surface px-3.5 py-2.5 text-xs text-text-main transition-colors outline-none focus:ring-1",
          error
            ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
            : "border-border focus:border-primary focus:ring-primary/20",
          disabled && "cursor-not-allowed opacity-60",
          !displayText && "text-text-muted",
          className,
        )}
      >
        <span className="truncate font-medium">
          {displayText || placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-primary" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          align="start"
          sideOffset={6}
          className="isolate z-50"
        >
          <Popover.Popup className="w-auto overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-xl">
            <Calendar
              mode="single"
              selected={parsedDate}
              onSelect={handleSelect}
              disabled={disabledMatcher}
              locale={vi}
              className="p-3"
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default DatePicker;
