import fs from "node:fs";
import path from "node:path";
import { leetCodeProblemSlugFromUrl, parseGeeksforgeeksProblemUrl } from "../apps/api/src/modules/catalog/inspect.js";
import { problems } from "../problems/manifests/index.js";
import { parseTufSheetPage, practiceItems, TUF_A2Z_SHEET_URL, type TufSheetItem } from "./lib/parseTufSheet.js";

const PERMISSION =
  "Striver A2Z sheet metadata and outbound links only. Problem statements are read on LeetCode or GeeksforGeeks; nothing is copied into CodeMentor.";

const OUT_DIR = path.resolve(process.cwd(), "problems/catalog");
const SHEET_JSON = path.join(OUT_DIR, "striver-a2z.sheet.json");
const CATALOG_JSON = path.join(OUT_DIR, "striver-a2z.json");
const UNRESOLVED_JSON = path.join(OUT_DIR, "striver-a2z.unresolved.json");
const OVERRIDES_JSON = path.join(OUT_DIR, "sheet-local-overrides.json");

type SheetLocalOverrides = {
  byNormTitle?: Record<string, string>;
  byTufSlug?: Record<string, string>;
};

function loadOverrides(): SheetLocalOverrides {
  if (!fs.existsSync(OVERRIDES_JSON)) return {};
  return JSON.parse(fs.readFileSync(OVERRIDES_JSON, "utf8")) as SheetLocalOverrides;
}

const args = new Set(process.argv.slice(2));
const probe = args.has("--probe");
const useCache = args.has("--cache") || !args.has("--fetch");

function normTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleToSlug(title: string): string {
  return normTitle(title).replace(/\s+/g, "-");
}

function topicSlug(section: string): string {
  const s = section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s.slice(0, 40) || "dsa";
}

function mapDifficulty(tuf: string | null): "EASY" | "MEDIUM" | "HARD" {
  const d = (tuf ?? "").toLowerCase();
  if (d === "basic" || d === "easy") return "EASY";
  if (d === "advanced" || d === "hard") return "HARD";
  return "MEDIUM";
}

function localSlugForSheetItem(item: TufSheetItem, overrides: SheetLocalOverrides): string | null {
  const fromTuf = overrides.byTufSlug?.[item.slug];
  if (fromTuf) return fromTuf;
  const n = normTitle(item.title);
  const fromTitleOverride = overrides.byNormTitle?.[n];
  if (fromTitleOverride) return fromTitleOverride;
  const matches = problems.filter((p) => normTitle(p.title) === n);
  if (matches.length === 1) return matches[0]!.slug;
  const fuzzy = problems.filter((p) => {
    const pn = normTitle(p.title);
    return pn.includes(n) || n.includes(pn);
  });
  if (fuzzy.length === 1) return fuzzy[0]!.slug;
  return null;
}

function gfgSlugCandidates(item: TufSheetItem): string[] {
  const out = new Set<string>();
  const fromTitle = titleToSlug(item.title);
  if (fromTitle) out.add(fromTitle);
  if (item.slug) out.add(item.slug);
  if (item.articleUrl) {
    const tail = item.articleUrl.split("/").filter(Boolean).pop() ?? "";
    if (tail) out.add(tail);
  }
  const compact = fromTitle.replace(/-ii$/i, "-2").replace(/-iii$/i, "-3");
  if (compact !== fromTitle) out.add(compact);
  return [...out].filter((s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s));
}

function gfgProblemUrl(slug: string): string {
  return `https://www.geeksforgeeks.org/problems/${slug}/1`;
}

async function gfgUrlExists(slug: string): Promise<boolean> {
  const url = gfgProblemUrl(slug);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CodeMentorCatalog/1.0)" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function resolveGfg(item: TufSheetItem): Promise<{ slug: string; url: string } | null> {
  for (const slug of gfgSlugCandidates(item)) {
    const url = gfgProblemUrl(slug);
    if (!probe) return { slug, url };
    if (await gfgUrlExists(slug)) return { slug, url };
    await sleep(60);
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const cachePath = path.join(OUT_DIR, "tuf-sheet.cache.html");
  let html: string;
  if (useCache && fs.existsSync(cachePath)) {
    html = fs.readFileSync(cachePath, "utf8");
    console.error(`Using cached sheet HTML (${cachePath}). Pass --fetch to refresh.`);
  } else {
    console.error(`Fetching ${TUF_A2Z_SHEET_URL}`);
    const res = await fetch(TUF_A2Z_SHEET_URL, { redirect: "follow" });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    html = await res.text();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(cachePath, html);
  }

  const allItems = parseTufSheetPage(html);
  const practice = practiceItems(allItems);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    SHEET_JSON,
    JSON.stringify(
      {
        source: "takeuforward-strivers-a2z-dsa-sheet",
        fetchedFrom: TUF_A2Z_SHEET_URL,
        generatedAt: new Date().toISOString(),
        practiceCount: practice.length,
        items: practice,
      },
      null,
      2,
    ),
  );

  type CatalogEntry = {
    source: "leetcode" | "geeksforgeeks";
    externalSlug: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    topics: string[];
    tags: string[];
    canonicalUrl: string;
    localSlug?: string;
  };

  function dedupeCatalogEntries(list: CatalogEntry[]): { entries: CatalogEntry[]; duplicates: { title: string; externalSlug: string; source: string }[] } {
    const byKey = new Map<string, CatalogEntry>();
    const duplicates: { title: string; externalSlug: string; source: string }[] = [];
    for (const entry of list) {
      const key = `${entry.source}:${entry.externalSlug}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, entry);
        continue;
      }
      duplicates.push({ title: entry.title, externalSlug: entry.externalSlug, source: entry.source });
      if (!existing.localSlug && entry.localSlug) byKey.set(key, entry);
    }
    return { entries: [...byKey.values()], duplicates };
  }

  const overrides = loadOverrides();
  const entriesRaw: CatalogEntry[] = [];
  const unresolved: { title: string; tufId: number; tufUrl: string | null; reason: string }[] = [];

  for (const item of practice) {
    const localSlug = localSlugForSheetItem(item, overrides) ?? undefined;
    const topics = [topicSlug(item.section)];
    const tags = ["striver-a2z", topicSlug(item.sectionPath[item.sectionPath.length - 1] ?? item.section)];
    const difficulty = mapDifficulty(item.tufDifficulty);

    const lcSlug = item.leetcodeUrl ? leetCodeProblemSlugFromUrl(item.leetcodeUrl) : null;
    if (lcSlug) {
      const slug = lcSlug;
      entriesRaw.push({
        source: "leetcode",
        externalSlug: slug,
        title: item.title,
        difficulty,
        topics,
        tags,
        canonicalUrl: `https://leetcode.com/problems/${slug}/description/`,
        ...(localSlug ? { localSlug } : {}),
      });
      continue;
    }

    const gfg = await resolveGfg(item);
    if (gfg) {
      const parsed = parseGeeksforgeeksProblemUrl(gfg.url);
      if (!parsed) {
        unresolved.push({ title: item.title, tufId: item.tufId, tufUrl: item.tufUrl, reason: "invalid gfg url" });
        continue;
      }
      entriesRaw.push({
        source: "geeksforgeeks",
        externalSlug: parsed,
        title: item.title,
        difficulty,
        topics,
        tags,
        canonicalUrl: gfg.url,
        ...(localSlug ? { localSlug } : {}),
      });
    } else {
      unresolved.push({
        title: item.title,
        tufId: item.tufId,
        tufUrl: item.tufUrl,
        reason: probe ? "no leetcode link and no verified GeeksforGeeks slug" : "no leetcode link (run with --probe to verify GFG)",
      });
    }
  }

  const { entries, duplicates } = dedupeCatalogEntries(entriesRaw);
  const catalog = { permission: PERMISSION, entries };
  fs.writeFileSync(CATALOG_JSON, JSON.stringify(catalog, null, 2));
  fs.writeFileSync(UNRESOLVED_JSON, JSON.stringify({ count: unresolved.length, items: unresolved }, null, 2));
  const byTitle: Record<string, string> = { ...(overrides.byNormTitle ?? {}) };
  const problemList = problems.map((p) => ({ slug: p.slug, norm: normTitle(p.title), title: p.title }));
  for (const p of problemList) byTitle[p.norm] = p.slug;
  fs.writeFileSync(path.join(OUT_DIR, "local-problem-index.json"), JSON.stringify({ byTitle, problems: problemList }, null, 0));
  fs.writeFileSync(
    path.join(OUT_DIR, "striver-a2z.duplicates.json"),
    JSON.stringify({ count: duplicates.length, note: "Same LeetCode/GFG slug appears twice on the sheet; only one catalog row is kept.", items: duplicates }, null, 2),
  );

  const lc = entries.filter((e) => e.source === "leetcode").length;
  const gfgCount = entries.filter((e) => e.source === "geeksforgeeks").length;
  console.log(
    JSON.stringify(
      {
        sheet: SHEET_JSON,
        catalog: CATALOG_JSON,
        practice: practice.length,
        catalogEntries: entries.length,
        sheetDuplicatesDropped: duplicates.length,
        leetcode: lc,
        geeksforgeeks: gfgCount,
        unresolved: unresolved.length,
        linkedLocal: entries.filter((e) => e.localSlug).length,
        probe,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
