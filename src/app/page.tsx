// Placeholder until the redesigned sections land; confirms fonts and brand tokens render.
export default function Home() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col justify-center gap-6 px-6 py-32 sm:px-20"
    >
      <p className="font-mono text-sm uppercase tracking-widest text-primary">
        Backend, cloud &amp; AI development
      </p>
      <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
        Software that holds up in production.
      </h1>
      <p className="max-w-xl text-lg text-body">
        ProdBuilds designs and builds backend systems, APIs and cloud
        infrastructure that scale without a painful rewrite.
      </p>
    </main>
  );
}
