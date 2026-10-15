// Container bọc bên ngoài phải là relative nhé hihi
export function GradientBackground() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `
        radial-gradient(125% 125% at 50% 10%, var(--color-surface) 30%, var(--color-secondary-dark) 100%)
      `,
        backgroundSize: "100% 100%",
      }}
    />
  );
}

export function GradientGridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `
      linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
      radial-gradient(circle 600px at 20% 100%, color-mix(in srgb, var(--color-status-active) 25%, transparent), transparent),
      radial-gradient(circle 600px at 80% 20%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent)
    `,
        backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
      }}
    />
  );
}

export function HightlightSideBackground() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `
        radial-gradient(circle 600px at 0% 200px, var(--color-secondary-dark), transparent),
        radial-gradient(circle 600px at 100% 200px, var(--color-secondary-dark), transparent)
      `,
      }}
    />
  );
}
