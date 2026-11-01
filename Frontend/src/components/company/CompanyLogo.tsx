import { getLoremAvt } from "@/utils/helper";

export interface CompanyLogoProps {
  logoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function CompanyLogo({ logoUrl, name, size = "md" }: CompanyLogoProps) {
  const sizeMap = {
    sm: "size-10 text-sm",
    md: "size-14 text-base",
    lg: "size-20 text-xl",
  };

  const fallbackSrc = getLoremAvt(name);

  return (
    <div
      className={`${sizeMap[size]} shrink-0 overflow-hidden rounded-lg border border-border bg-white`}
    >
      <img
        src={logoUrl || fallbackSrc}
        alt={name}
        className="size-full object-contain"
        loading="lazy"
        onError={(event) => {
          const img = event.currentTarget;
          if (img.src !== new URL(fallbackSrc, img.baseURI).href) {
            img.onerror = null;
            img.src = fallbackSrc;
          }
        }}
      />
    </div>
  );
}

export default CompanyLogo;
