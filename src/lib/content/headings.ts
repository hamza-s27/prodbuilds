// Table-of-contents data from a post's MDX source. Post headings are written as
// explicit `<H2 id="…">Text</H2>` (see CLAUDE.md), so a pattern match is exact.

export interface PostHeading {
  readonly id: string;
  readonly text: string;
}

const H2_PATTERN = /<H2 id="([^"]+)">([\s\S]*?)<\/H2>/g;

/** Inline markdown (code spans, *emphasis*) reduced to its text; underscores in identifiers survive. */
const plainText = (markdown: string) =>
  markdown
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function extractHeadings(source: string): PostHeading[] {
  return [...source.matchAll(H2_PATTERN)].map(([, id, text]) => ({ id: id!, text: plainText(text!) }));
}

/** Share of the viewport, from the top, that a heading must reach to count as being read. */
export const READ_LINE = 0.3;

/**
 * The heading being read: the last one whose top has reached the read line.
 * At the end of the page a short last section can never get that high, so
 * there any heading on screen counts. `tops` are viewport tops, in page order.
 */
export function headingBeingRead<Id extends string>(
  ids: readonly Id[],
  tops: readonly number[],
  viewportHeight: number,
  atEnd: boolean,
): Id | null {
  const line = atEnd ? viewportHeight : viewportHeight * READ_LINE;
  const index = tops.findLastIndex((top) => top <= line);
  return index === -1 ? null : ids[index]!;
}
