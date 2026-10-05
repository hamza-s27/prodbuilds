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

The LightPillar hero shader is re-implemented on `ogl` from the React Bits idea, not copied line for line; credit React Bits in a source comment anyway.

## Runtime and build dependencies

| Package                                 | Licence                                                                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| next, react, react-dom                  | MIT                                                                                                                                                      |
| motion                                  | MIT                                                                                                                                                      |
| gsap, @gsap/react                       | GSAP Standard "no charge" licence (free for commercial use since 2025; may not be used in a product that competes with Webflow's visual animation tools) |
| lenis                                   | MIT                                                                                                                                                      |
| ogl                                     | Unlicense                                                                                                                                                |
| lucide-react                            | ISC                                                                                                                                                      |
| radix-ui                                | MIT                                                                                                                                                      |
| shadcn, cn, tw-animate-css, tailwindcss | MIT                                                                                                                                                      |

## Scrolltide references

Beacon, Abyssal and Halide are visual references only. No Scrolltide prompts, code or assets are used.
