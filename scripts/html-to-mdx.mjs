// One-off migration: legacy post HTML (tests/fixtures/legacy/html) → MDX in
// src/content/posts, and each inline SVG diagram → a TSX component in
// src/components/blog/diagrams. Output is committed and then edited by hand.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as cheerio from "cheerio";

const SLUGS = [
  "spring-boot-scheduled-jobs-multiple-instances",
  "jobrunr-skipping-recurring-jobs",
  "firebase-auction-close-on-time",
];
const DIAGRAM_NAMES = {
  "fig-skew": "ClockSkewDiagram",
  "fig-overrun": "LockOverrunDiagram",
  "fig-gap": "PollingGapDiagram",
  "fig-extend": "SoftCloseDiagram",
};
const POSTS_DIR = resolve("src/content/posts");
const DIAGRAMS_DIR = resolve("src/components/blog/diagrams");

const escapeText = (text) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/[{}]/g, (c) => `\\${c}`)
    .replace(/</g, "&lt;")
    .replace(/\*/g, "\\*");
const escapeAttr = (text) => text.replace(/"/g, "&quot;");

function inline($, nodes) {
  return nodes
    .map((node) => {
      if (node.type === "text") return escapeText(node.data);
      if (node.type !== "tag") return "";
      const el = $(node);
      const inner = () => inline($, node.children);
      switch (node.tagName) {
        case "code": {
          const text = el.text();
          return text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``;
        }
        case "strong":
          return `**${inner()}**`;
        case "em":
          return `*${inner()}*`;
        case "a":
          return `[${inner()}](${el.attr("href")})`;
        case "br":
          return "<br />";
        case "span":
          if (el.hasClass("verdict")) {
            return `<Verdict tone="${el.hasClass("good") ? "good" : "bad"}">${inner()}</Verdict>`;
          }
          return inner();
        default:
          throw new Error(`Unhandled inline <${node.tagName}>`);
      }
    })
    .join("")
    .replace(/\s*\n\s*/g, " ");
}

const inlineOf = ($, el) => inline($, $(el).contents().toArray()).trim();

function list($, el, ordered) {
  return $(el)
    .children("li")
    .toArray()
    .map((li, i) => `${ordered ? `${i + 1}.` : "-"} ${inlineOf($, li)}`)
    .join("\n");
}

function table($, el) {
  const cell = (c) => inlineOf($, c).replace(/\|/g, "\\|");
  const rows = $(el)
    .find("tr")
    .toArray()
    .map((tr) => $(tr).children().toArray().map(cell));
  const [head, ...body] = rows;
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...body.map(line)].join("\n");
}

function stats($, el) {
  const items = $(el)
    .children("li")
    .toArray()
    .map((li) => {
      const num = $(li).find(".stat-num");
      const tone = num.hasClass("bad") ? "bad" : num.hasClass("plain") ? "plain" : "good";
      return `<Stat value="${escapeAttr(num.text())}" tone="${tone}">${inlineOf($, $(li).find(".stat-lbl"))}</Stat>`;
    });
  return `<Stats>\n${items.join("\n")}\n</Stats>`;
}

function heading($, el) {
  return `<H2 id="${$(el).attr("id")}">${inlineOf($, el)}</H2>`;
}

function blocks($, children, diagrams) {
  return children
    .toArray()
    .map((el) => block($, el, diagrams))
    .filter(Boolean)
    .join("\n\n");
}

function block($, el, diagrams) {
  const $el = $(el);
  const tag = el.tagName;
  if (tag === "p" && $el.hasClass("lede")) return `<Lede>${inlineOf($, el)}</Lede>`;
  if (tag === "p" && $el.hasClass("sources")) return `<Sources>${inlineOf($, el)}</Sources>`;
  if (tag === "p") return inlineOf($, el);
  if (tag === "h2") return heading($, el);
  if (tag === "ul" && $el.hasClass("stats")) return stats($, el);
  if (tag === "ul") return list($, el, false);
  if (tag === "ol") return list($, el, true);
  if (tag === "pre") {
    const code = $el.find("code");
    const lang = (code.attr("class") ?? "").replace("language-", "") || "text";
    return `\`\`\`${lang}\n${code.text().replace(/\n$/, "")}\n\`\`\``;
  }
  if (tag === "section" && $el.hasClass("tldr"))
    return `<Tldr>\n\n${blocks($, $el.children(), diagrams)}\n\n</Tldr>`;
  if (tag === "div" && $el.hasClass("table-wrap")) {
    return `<TableWrap label="${escapeAttr($el.attr("aria-label") ?? "Table")}">\n\n${table($, $el.find("table"))}\n\n</TableWrap>`;
  }
  if (tag === "div" && $el.hasClass("callout")) {
    const label = $el.find(".callout-label").text();
    const body = blocks($, $el.children(":not(.callout-label)"), diagrams);
    const tone = $el.hasClass("bad") ? "bad" : "note";
    return `<Callout tone="${tone}" label="${escapeAttr(label)}">\n\n${body}\n\n</Callout>`;
  }
  if (tag === "figure") return figure($, el, diagrams);
  if (tag === "div" && $el.hasClass("post-footer"))
    return `<PostFooter>\n\n${blocks($, $el.children(), diagrams)}\n\n</PostFooter>`;
  throw new Error(`Unhandled block <${tag} class="${$el.attr("class") ?? ""}">`);
}

function figure($, el, diagrams) {
  const svg = $(el).find("svg").first();
  const titleId = svg.find("title").attr("id") ?? "";
  const name = DIAGRAM_NAMES[titleId.replace(/-t$/, "")];
  if (!name) throw new Error(`No diagram name for ${titleId}`);
  diagrams.push({ name, svg: svgToJsx($, svg.get(0), 2) });
  return `<Figure>\n<${name} />\n<Caption>${inlineOf($, $(el).find("figcaption"))}</Caption>\n</Figure>`;
}

const camel = (name) =>
  name === "class"
    ? "className"
    : /^(aria|data)-/.test(name)
      ? name
      : name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function svgToJsx($, node, depth) {
  const pad = "  ".repeat(depth);
  if (node.type === "text") {
    const text = node.data.trim();
    return text ? `${pad}{${JSON.stringify(text)}}` : "";
  }
  if (node.type !== "tag") return "";
  const attrs = Object.entries(node.attribs)
    .map(([k, v]) => ` ${camel(k)}="${escapeAttr(v)}"`)
    .join("");
  const children = node.children.map((child) => svgToJsx($, child, depth + 1)).filter(Boolean);
  if (children.length === 0) return `${pad}<${node.tagName}${attrs} />`;
  return `${pad}<${node.tagName}${attrs}>\n${children.join("\n")}\n${pad}</${node.tagName}>`;
}

function diagramModule({ name, svg }) {
  return `// Migrated from the legacy post HTML; styled by .diagram rules in prose.css.\nexport function ${name}() {\n  return (\n${svg}\n  );\n}\n`;
}

// Migration is done and the output may have been edited by hand since: refuse
// to overwrite it unless explicitly asked.
const existing = SLUGS.filter((slug) => existsSync(join(POSTS_DIR, `${slug}.mdx`)));
if (existing.length > 0 && !process.argv.includes("--force")) {
  console.error(`[html-to-mdx] ${existing.join(", ")} already migrated. Re-run with --force to overwrite.`);
  process.exit(1);
}

mkdirSync(DIAGRAMS_DIR, { recursive: true });
for (const slug of SLUGS) {
  const $ = cheerio.load(readFileSync(resolve(`tests/fixtures/legacy/html/blog_${slug}.html`), "utf8"));
  const diagrams = [];
  const mdx = blocks($, $("article.post").children(), diagrams);
  writeFileSync(join(POSTS_DIR, `${slug}.mdx`), `${mdx}\n`);
  for (const diagram of diagrams)
    writeFileSync(join(DIAGRAMS_DIR, `${diagram.name}.tsx`), diagramModule(diagram));
  console.log(`${slug}: ${mdx.length} chars, ${diagrams.length} diagram(s)`);
}
