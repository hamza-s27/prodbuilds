import type { RichText } from "@/content/types";

/** Flattens rich text to plain text, e.g. for structured data. */
export function toPlainText(text: RichText): string {
  return text.map((node) => (typeof node === "string" ? node : node.label)).join("");
}
