/** Parse Striver A2Z syllabus embedded in takeuforward.org sheet page RSC payload. */

export const TUF_A2Z_SHEET_URL =
  "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/";

export type TufSheetItem = {
  tufId: number;
  slug: string | null;
  title: string;
  section: string;
  sectionPath: string[];
  layout: string | null;
  tufDifficulty: string | null;
  leetcodeUrl: string | null;
  articleUrl: string | null;
  videoUrl: string | null;
  tufUrl: string | null;
};

type Syllabus = { fields: string[][]; rows: unknown[][]; roots: number[] };

function flightPayload(page: string): string {
  let buf = "";
  for (const part of page.split("self.__next_f.push(").slice(1)) {
    const end = part.indexOf(")</script>");
    if (end < 0) continue;
    try {
      const arr = JSON.parse(part.slice(0, end)) as unknown;
      if (Array.isArray(arr) && arr.length > 1 && typeof arr[1] === "string") buf += arr[1];
    } catch {
      /* skip malformed chunk */
    }
  }
  return buf;
}

function findObject(payload: string, key: string): Record<string, unknown> {
  const needle = `"${key}":`;
  const at = payload.indexOf(needle);
  if (at < 0) throw new Error(`${key} not found in takeuforward page payload.`);
  const brace = payload.indexOf("{", at + needle.length);
  let depth = 0;
  let i = brace;
  for (; i < payload.length; i++) {
    const c = payload[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  return JSON.parse(payload.slice(brace, i)) as Record<string, unknown>;
}

function parseSyllabus(payload: string): Syllabus {
  return findObject(payload, "sheet_syllabus") as unknown as Syllabus;
}

function parseOutline(payload: string): { nodes: OutlineNode[]; problemCount?: number } {
  return findObject(payload, "syllabusOutline") as { nodes: OutlineNode[]; problemCount?: number };
}

type OutlineNode = { label?: string; href?: string; children?: OutlineNode[]; id?: number };

function flattenOutline(nodes: OutlineNode[], path: string[], out: { path: string[]; node: OutlineNode }[]) {
  for (const node of nodes) {
    if (node.children?.length) flattenOutline(node.children, [...path, node.label ?? ""], out);
    else out.push({ path, node });
  }
}

function rowdict(fields: string[][], row: unknown[]): Record<string, unknown> {
  const schema = fields[row[0] as number];
  const out: Record<string, unknown> = {};
  for (let i = 0; i < schema.length; i++) out[schema[i]!] = row[i + 1];
  return out;
}

function practiceUrl(
  slug: string | null,
  tid: number,
  outlineHref: Map<string, string>,
  contestHref: Map<number, string>,
): { url: string | null; fromOutline: boolean } {
  if (!slug) return { url: null, fromOutline: false };
  const href = outlineHref.get(`${tid}:${slug}`);
  if (href && !href.includes("/contest/")) return { url: `https://takeuforward.org${href}`, fromOutline: true };
  if (contestHref.has(tid)) return { url: `https://takeuforward.org${contestHref.get(tid)!}`, fromOutline: true };
  return { url: `https://takeuforward.org/practice/dsa/${slug}`, fromOutline: false };
}

export function parseTufSheetPage(html: string): TufSheetItem[] {
  const payload = flightPayload(html);
  if (!payload) throw new Error("Could not read RSC payload from takeuforward sheet page.");
  const syllabus = parseSyllabus(payload);
  const outline = parseOutline(payload);
  const fields = syllabus.fields;
  const rows = syllabus.rows as unknown[][];

  const records = new Map<number, { path: string[]; row: Record<string, unknown> }>();
  const order: number[] = [];

  function walk(index: number, path: string[]) {
    const row = rowdict(fields, rows[index]!);
    if (row.type === "category") {
      for (const child of (row.children as number[] | undefined) ?? []) walk(child, [...path, String(row.label ?? "")]);
      return;
    }
    const id = row.id as number;
    if (!records.has(id)) {
      order.push(id);
      records.set(id, { path, row });
    }
  }
  for (const root of syllabus.roots) walk(root, []);

  const outlineFlat: { path: string[]; node: OutlineNode }[] = [];
  flattenOutline(outline.nodes, [], outlineFlat);
  const outlineHref = new Map<string, string>();
  const contestHref = new Map<number, string>();
  for (const { node } of outlineFlat) {
    const href = node.href ?? "";
    const slug = href.split("?", 1)[0]?.split("/").pop() ?? "";
    if (node.id != null && slug) outlineHref.set(`${node.id}:${slug}`, href);
    if (node.id != null && href.includes("/contest/")) contestHref.set(node.id, href);
  }

  const items: TufSheetItem[] = [];
  for (const tid of order) {
    const rec = records.get(tid)!;
    const row = rec.row;
    const slug = typeof row.slug === "string" ? row.slug : null;
    const { url: tufUrl } = practiceUrl(slug, tid, outlineHref, contestHref);
    const freeBlog = typeof row.free_blog_link === "string" ? row.free_blog_link : null;
    items.push({
      tufId: tid,
      slug,
      title: String(row.label ?? "").trim(),
      section: rec.path[0] ?? "",
      sectionPath: rec.path,
      layout: typeof row.layoutType === "string" ? row.layoutType : null,
      tufDifficulty: typeof row.difficulty === "string" ? row.difficulty : null,
      leetcodeUrl: typeof row.leetcode_link === "string" ? row.leetcode_link : null,
      articleUrl: freeBlog ? `https://takeuforward.org${freeBlog}` : null,
      videoUrl: typeof row.yt_video === "string" ? row.yt_video : null,
      tufUrl,
    });
  }
  return items;
}

export function practiceItems(items: TufSheetItem[]): TufSheetItem[] {
  return items.filter((item) => item.layout === "practice" && item.title.length > 0);
}
