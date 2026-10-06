# Third-party code and licences

Checked 2026-10-05. Copy-paste component sources live in our repo once added, so their licence terms travel with the code. Keep this table current when a registry component is added.

## Component registries (copied in via the shadcn CLI)

| Source                          | Licence                                                                         | Use on prodbuilds.com                                    | Conditions                                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Magic UI (`@magicui/*`)         | MIT                                                                             | Allowed                                                  | Keep the copyright notice                                                                                                                                                                                 |
| React Bits (`@react-bits/*`)    | MIT + Commons Clause                                                            | Allowed "as part of an application, website, or product" | Keep the notice; may not sell or redistribute the components themselves (e.g. as a UI kit)                                                                                                                |
| Animate UI (`@animate-ui/*`)    | MIT + Commons Clause                                                            | Allowed, same wording as React Bits                      | Same as React Bits                                                                                                                                                                                        |
| Aceternity UI (`@aceternity/*`) | Aceternity Licence (published terms cover paid items; free-tier terms unstated) | **Avoid copying.**                                       | Paid terms forbid redistributing source or derivatives as templates. Because the free-tier terms are unclear, write our own Tracing Beam (it is a small `useScroll` + SVG path) instead of copying theirs |
| Uiverse                         | MIT                                                                             | Allowed for one-off pieces                               | Keep the notice                                                                                                                                                                                           |

The light-pillar hero shader is original work (raw WebGL, no library) inspired by the React Bits LightPillar idea; React Bits is credited in a source comment.

## Runtime and build dependencies

| Package                                 | Licence                                                                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| next, react, react-dom                  | MIT                                                                                                                                                      |
| motion                                  | MIT                                                                                                                                                      |
| gsap, @gsap/react                       | GSAP Standard "no charge" licence (free for commercial use since 2025; may not be used in a product that competes with Webflow's visual animation tools) |
| lenis                                   | MIT                                                                                                                                                      |
| lucide-react                            | ISC                                                                                                                                                      |
| radix-ui                                | MIT                                                                                                                                                      |
| shadcn, cn, tw-animate-css, tailwindcss | MIT                                                                                                                                                      |

## Scrolltide references

Beacon, Abyssal and Halide are visual references only. No Scrolltide prompts, code or assets are used.

## Generated imagery

- `public/images/heroes/{stack,pipeline,handshake,vault,archive}-{800,1376}.webp`: hero poster stills generated by the site owner in Google Flow (Nano Banana Pro), project "prodbuilds", 2026-10-07, from prompts written for this redesign; converted to WebP with sharp. Used as each page hero's poster and as the texture its cinemagraph shader animates (`src/components/hero/scenes/cinemagraph.ts`, original code). Google's terms for generated content apply.
