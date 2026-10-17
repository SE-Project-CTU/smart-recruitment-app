import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import {
  ToggleGroup as ToggleGroupPrimitive,
  Toggle as TogglePrimitive,
  ToggleGroupHighlight as ToggleGroupHighlightPrimitive,
  ToggleHighlight as ToggleHighlightPrimitive,
  useToggleGroup as useToggleGroupPrimitive,
  type ToggleGroupProps as ToggleGroupPrimitiveProps,
  type ToggleProps as TogglePrimitiveProps,
} from "src/components/animate-ui/primitives/base/toggle-group";
import { toggleVariants } from "src/components/animate-ui/components/base/toggle";
import { cn } from "src/lib/utils";
import { getStrictContext } from "src/lib/get-strict-context";

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<VariantProps<typeof toggleVariants>>("ToggleGroupContext");

type ToggleGroupProps = ToggleGroupPrimitiveProps &
  VariantProps<typeof toggleVariants>;

function ToggleGroup({
  className,
  variant,
  size,
  children,
  multiple,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-0.5 rounded-lg data-[variant=outline]:border data-[variant=outline]:p-0.5 data-[variant=outline]:shadow-xs",
        className,
      )}
      multiple={multiple}
      {...props}
    >
      <ToggleGroupProvider value={{ variant, size }}>
        {!multiple ? (
          <ToggleGroupHighlightPrimitive className="rounded-md bg-status-active">
            {children}
          </ToggleGroupHighlightPrimitive>
        ) : (
          children
        )}
      </ToggleGroupProvider>
    </ToggleGroupPrimitive>
  );
}

type ToggleProps = TogglePrimitiveProps & VariantProps<typeof toggleVariants>;

function Toggle({ className, children, variant, size, ...props }: ToggleProps) {
  const { variant: contextVariant, size: contextSize } = useToggleGroup();
  const { multiple } = useToggleGroupPrimitive();

  return (
    <ToggleHighlightPrimitive
      value={props.value?.toString()}
      className={cn(multiple && "rounded-md bg-accent")}
    >
      <TogglePrimitive
        data-variant={contextVariant || variant}
        data-size={contextSize || size}
        className={cn(
          toggleVariants({
            variant: contextVariant || variant,
            size: contextSize || size,
          }),
          "min-w-0 flex-1 shrink-0 rounded-md border-0 shadow-none focus:z-10 focus-visible:z-10",
          className,
        )}
        {...props}
      >
        {children}
      </TogglePrimitive>
    </ToggleHighlightPrimitive>
  );
}

export { ToggleGroup, Toggle, type ToggleGroupProps, type ToggleProps };
