export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="animate-cinematic-drift absolute inset-0 [background-image:radial-gradient(circle_at_22%_18%,rgba(0,51,160,0.06),transparent_42%),radial-gradient(circle_at_78%_82%,rgba(227,24,55,0.04),transparent_44%)] [background-position:20%_20%,80%_80%] [background-size:135%_135%]" />
      <div className="absolute inset-0 opacity-[0.4] [background-image:radial-gradient(circle,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:22px_22px]" />
    </div>
  );
}
