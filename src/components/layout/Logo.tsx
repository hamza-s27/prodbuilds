interface LogoProps {
  readonly className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <a href="/" className={className}>
      {/* A small static SVG: next/image would add client JS for no gain. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="ProdBuilds" width={155} height={24} />
    </a>
  );
}
