function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export interface CompanyLogoProps {
  logoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function CompanyLogo({
  logoUrl,
  name,
  size = "md",
}: CompanyLogoProps) {
  const sizeMap = {
    sm: "size-10 text-sm",
    md: "size-14 text-base",
    lg: "size-20 text-xl",
  };

  if (logoUrl) {
    return (
      <div
        className={`${sizeMap[size]} shrink-0 overflow-hidden rounded-2xl border border-border bg-white`}
      >
        <img
          src={logoUrl}
          alt={name}
          className="size-full object-contain p-1.5"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} flex shrink-0 items-center justify-center rounded-2xl bg-primary/8 font-semibold text-primary`}
    >
      {getInitials(name)}
    </div>
  );
}
