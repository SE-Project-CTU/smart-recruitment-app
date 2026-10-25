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

export function CTAMeshGradient() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: `
      radial-gradient(ellipse 60% 80% at 8% 10%, rgba(2, 18, 69, 0.95), transparent 70%),
      radial-gradient(ellipse 45% 45% at 95% 5%, rgba(224, 139, 94, 0.75), transparent 60%),
      radial-gradient(ellipse 55% 70% at 65% 35%, rgba(123, 209, 249, 0.85), transparent 65%),
      radial-gradient(ellipse 70% 60% at 85% 85%, rgba(23, 58, 115, 0.90), transparent 70%),
      radial-gradient(ellipse 80% 50% at 30% 90%, rgba(18, 48, 102, 0.85), transparent 75%),
      linear-gradient(110deg, #0d2754 0%, #3e88b5 50%, #90d3f7 100%)
    `,
      }}
    />
  );
}
