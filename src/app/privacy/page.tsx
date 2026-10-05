import { LegalPage } from "@/components/layout/LegalPage";
import Body from "@/content/legal/privacy.mdx";
import { pages } from "@/content/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata(pages["/privacy"].seo);

export default function Page() {
  return <LegalPage path="/privacy" Body={Body} />;
}
