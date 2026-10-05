import type { Metadata } from "next";
import { IBM_Plex_Mono, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const TITLE = "ProdBuilds | Backend, Cloud & AI Software Development";
const DESCRIPTION =
  "ProdBuilds designs and builds backend systems, APIs, cloud infrastructure and AI integrations that hold up in production, from a first MVP to the platform you already run.";

export const metadata: Metadata = {
  metadataBase: new URL("https://prodbuilds.com"),
  title: { default: TITLE, template: "%s | ProdBuilds" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_US",
    siteName: "ProdBuilds",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${plexMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
