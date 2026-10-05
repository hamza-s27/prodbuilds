import { LegalPage } from "@/components/layout/LegalPage";
import Body from "@/content/legal/terms.mdx";
import { pages } from "@/content/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata(pages["/terms"].seo);

export default function Page() {
  return <LegalPage path="/terms" Body={Body} />;
}
