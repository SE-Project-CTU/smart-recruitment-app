import type { ImgHTMLAttributes } from "react";
import { getLoremAvt } from "@/utils/helper";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  name?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  name,
  alt = "User Avatar",
  className = "size-8 rounded-full",
  onError,
  ...props
}: UserAvatarProps) {
  const fallbackSrc = getLoremAvt(name);

  return (
    <img
      {...props}
      src={src || fallbackSrc}
      alt={alt}
      className={cn(className, "object-cover")}
      loading="lazy"
      onError={(event) => {
        onError?.(event);

        const img = event.currentTarget;

        if (img.src !== new URL(fallbackSrc, img.baseURI).href) {
          img.onerror = null;
          img.src = fallbackSrc;
        }
      }}
    />
  );
}
