import { Check } from "lucide-react";
import { getPost } from "@/content/posts";
import type { Service } from "@/content/types";
import { LayerGlyph } from "./LayerGlyph";
import { StackChips } from "./StackChips";

interface ServiceLayerSectionProps {
  readonly service: Service;
}

/** One service on /services, inside StackDive. Keeps the legacy id and aria-labelledby. */
export function ServiceLayerSection({ service }: ServiceLayerSectionProps) {
  const headingId = `${service.id}-heading`;
  const related = service.relatedPostSlugs.flatMap((slug) => getPost(slug) ?? []);

  return (
    <section
      id={service.id}
      aria-labelledby={headingId}
      className="grid grid-cols-12 gap-x-[clamp(1rem,2vw,2rem)] gap-y-8 py-(--space-section)"
    >
      <div className="col-span-12 rule-ticks" aria-hidden />
      {/* From 1024px the sticky stack navigation replaces the glyph. */}
      <div className="col-span-12 flex items-center gap-6 md:col-span-3 md:flex-col md:items-start lg:col-span-12">
        <span className="lg:hidden">
          <LayerGlyph layer={service.layer} />
        </span>
        <p className="hud">{service.layer.hud}</p>
      </div>
      <div className="reveal col-span-12 md:col-span-9 lg:col-span-12 xl:col-span-11">
        <p className="hud text-primary">{service.tag}</p>
        <h2 id={headingId} className="display mt-4 text-(length:--text-h2)">
          {service.title}
        </h2>
        <p className="mt-6 max-w-2xl text-(length:--text-lead) text-body">{service.intro}</p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="hud">What’s included</h3>
            <ul className="mt-5 space-y-3">
              {service.included.map((item) => (
                <li key={item} className="flex gap-3 text-body">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="hud">Typical stack</h3>
              <StackChips items={service.stack} className="mt-5" />
            </div>
            {related.length > 0 && (
              <div>
                <h3 className="hud">Related reading</h3>
                <ul className="mt-5 space-y-3">
                  {related.map((post) => (
                    <li key={post.slug}>
                      <a href={`/blog/${post.slug}`} className="link-inline">
                        {post.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
