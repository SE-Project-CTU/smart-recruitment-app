import * as React from "react";
import {
  toast as baseUiToast,
  type ToastInput,
} from "@/components/ui/toast";

export type ToastActionElement = React.ReactElement;
export type ToastType = "default" | "destructive" | "success" | "warning" | "info";

export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  type?: ToastType;
  duration?: number;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export type ToasterToast = ToastItem;

const toastAdapter = (props: ToastInput) => {
  if (typeof props === "string") {
    return baseUiToast.info(props);
  }
  const toastType =
    props.variant === "destructive" ? "error" : props.type || "default";
  return baseUiToast.add({
    type: toastType as "default" | "success" | "error" | "warning" | "info" | "loading",
    title: props.title,
    description: props.description,
  });
};

toastAdapter.default = (props: ToastInput) =>
  typeof props === "string"
    ? baseUiToast.add({ description: props })
    : baseUiToast.add({ ...props, type: "default" });

toastAdapter.destructive = (props: ToastInput) => baseUiToast.error(props);

toastAdapter.error = (props: ToastInput) => baseUiToast.error(props);

toastAdapter.success = (props: ToastInput) => baseUiToast.success(props);

toastAdapter.warning = (props: ToastInput) => baseUiToast.warning(props);

toastAdapter.info = (props: ToastInput) => baseUiToast.info(props);

toastAdapter.add = (props: Record<string, unknown>) => baseUiToast.add(props);

function useToast() {
  return {
    toasts: [],
    toast: toastAdapter,
    dismiss: (toastId?: string) => {
      if (toastId) {
        baseUiToast.close(toastId);
      }
    },
  };
}

export { useToast, toastAdapter as toast };
export default toastAdapter;
