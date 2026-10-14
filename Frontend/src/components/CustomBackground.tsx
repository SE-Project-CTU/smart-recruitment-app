// Container bọc bên ngoài phải là relative nhé hihi
export function GradientBackground() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `
        radial-gradient(125% 125% at 50% 10%, #ffffff 30%, #6fc3e8 100%)
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
      radial-gradient(circle 600px at 20% 100%, rgba(56, 189, 248, 0.25), transparent),
      radial-gradient(circle 600px at 80% 20%, rgba(27, 59, 111, 0.15), transparent)
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
        radial-gradient(circle 600px at 0% 200px, #6fc3e8, transparent),
        radial-gradient(circle 600px at 100% 200px, #6fc3e8, transparent)
      `,
      }}
    />
  );
}
