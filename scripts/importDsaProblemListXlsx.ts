import fs from "node:fs";
import path from "node:path";
import { leetCodeProblemSlugFromUrl, parseGeeksforgeeksProblemUrl } from "../apps/api/src/modules/catalog/inspect.js";
import { problems } from "../problems/manifests/index.js";
import {
  readDsaProblemListXlsx,
  xlsxRowsToSheetFile,
  type XlsxSheetFile,
} from "./lib/parseDsaProblemListXlsx.js";

const PERMISSION =
  "Striver A2Z sheet metadata and outbound links only. Problem statements are read on LeetCode or GeeksforGeeks; nothing is copied into CodeMentor.";

const ROOT = process.cwd();
const XLSX_PATH = path.join(ROOT, "dsa-problem-lists.xlsx");
const OUT_DIR = path.join(ROOT, "problems/catalog");
const SHEET_JSON = path.join(OUT_DIR, "striver-a2z.xlsx.json");
const CATALOG_JSON = path.join(OUT_DIR, "striver-a2z.json");
const OVERRIDES_JSON = path.join(OUT_DIR, "sheet-local-overrides.json");
const COVERAGE_JSON = path.join(OUT_DIR, "sheet-coverage.json");

type SheetLocalOverrides = { byNormTitle?: Record<string, string>; byTufSlug?: Record<string, string> };

function normTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function loadOverrides(): SheetLocalOverrides {
  if (!fs.existsSync(OVERRIDES_JSON)) return {};
  return JSON.parse(fs.readFileSync(OVERRIDES_JSON, "utf8")) as SheetLocalOverrides;
}

function localSlugForItem(
  item: XlsxSheetFile["items"][number],
  overrides: SheetLocalOverrides,
): string | null {
  const fromTuf = overrides.byTufSlug?.[item.slug];
  if (fromTuf) return fromTuf;
  const n = normTitle(item.title);
  const fromTitleOverride = overrides.byNormTitle?.[n];
  if (fromTitleOverride) return fromTitleOverride;
  const exact = problems.filter((p) => normTitle(p.title) === n);
  if (exact.length === 1) return exact[0]!.slug;
  const fuzzy = problems.filter((p) => {
    const pn = normTitle(p.title);
    return pn.includes(n) || n.includes(pn);
  });
  if (fuzzy.length === 1) return fuzzy[0]!.slug;
  if (item.leetcodeUrl) {
    const lc = leetCodeProblemSlugFromUrl(item.leetcodeUrl);
    if (lc) {
      const bySlug = problems.find((p) => p.slug === lc || normTitle(p.title).includes(lc.replace(/-/g, " ")));
      if (bySlug) return bySlug.slug;
    }
  }
  return null;
}

function mapDifficulty(sheetDifficulty: string | null, tufDifficulty: string | null): "EASY" | "MEDIUM" | "HARD" {
  const d = (sheetDifficulty ?? tufDifficulty ?? "").toLowerCase();
  if (d === "easy" || d === "basic") return "EASY";
  if (d === "hard" || d === "advanced") return "HARD";
  return "MEDIUM";
}

function topicSlug(section: string): string {
  const s = section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s.slice(0, 40) || "dsa";
}

function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`Missing ${XLSX_PATH}`);
    process.exit(1);
  }

  const overrides = loadOverrides();
  const rows = readDsaProblemListXlsx(XLSX_PATH);
  const sheet = xlsxRowsToSheetFile(rows);
  fs.writeFileSync(SHEET_JSON, JSON.stringify(sheet, null, 2));

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

  const entries: CatalogEntry[] = [];
  const missingLocal: { title: string; category: string; subcategory: string; leetcodeUrl: string | null; gfgUrl: string | null }[] =
    [];

  for (const item of sheet.items) {
    const localSlug = localSlugForItem(item, overrides) ?? undefined;
    const topics = [topicSlug(item.section)];
    const tags = ["striver-a2z", topicSlug(item.sectionPath[item.sectionPath.length - 1] ?? item.section)];
    const difficulty = mapDifficulty(item.sheetDifficulty, item.tufDifficulty);

    if (item.leetcodeUrl) {
      const slug = leetCodeProblemSlugFromUrl(item.leetcodeUrl);
      if (slug) {
        entries.push({
          source: "leetcode",
          externalSlug: slug,
          title: item.title,
          difficulty,
          topics,
          tags,
          canonicalUrl: `https://leetcode.com/problems/${slug}/description/`,
          ...(localSlug ? { localSlug } : {}),
        });
        if (!localSlug) missingLocal.push({ title: item.title, category: item.section, subcategory: item.sectionPath[1] ?? "", leetcodeUrl: item.leetcodeUrl, gfgUrl: item.gfgUrl });
        continue;
      }
    }

    if (item.gfgUrl) {
      const slug = parseGeeksforgeeksProblemUrl(item.gfgUrl);
      if (slug) {
        entries.push({
          source: "geeksforgeeks",
          externalSlug: slug,
          title: item.title,
          difficulty,
          topics,
          tags,
          canonicalUrl: item.gfgUrl,
          ...(localSlug ? { localSlug } : {}),
        });
        if (!localSlug) missingLocal.push({ title: item.title, category: item.section, subcategory: item.sectionPath[1] ?? "", leetcodeUrl: item.leetcodeUrl, gfgUrl: item.gfgUrl });
        continue;
      }
    }

    const fallbackSlug = item.slug;
    entries.push({
      source: "geeksforgeeks",
      externalSlug: fallbackSlug,
      title: item.title,
      difficulty,
      topics,
      tags,
      canonicalUrl: item.tufUrl ?? item.articleUrl ?? `https://takeuforward.org/plus/dsa/problems/${fallbackSlug}`,
      ...(localSlug ? { localSlug } : {}),
    });
    if (!localSlug) missingLocal.push({ title: item.title, category: item.section, subcategory: item.sectionPath[1] ?? "", leetcodeUrl: item.leetcodeUrl, gfgUrl: item.gfgUrl });
  }

  const byKey = new Map<string, CatalogEntry>();
  for (const entry of entries) {
    const key = `${entry.source}:${entry.externalSlug}`;
    const existing = byKey.get(key);
    if (!existing || (!existing.localSlug && entry.localSlug)) byKey.set(key, entry);
  }

  const catalogEntries = [...byKey.values()];
  fs.writeFileSync(CATALOG_JSON, JSON.stringify({ permission: PERMISSION, entries: catalogEntries }, null, 2));

  const byTitle: Record<string, string> = { ...(overrides.byNormTitle ?? {}) };
  for (const p of problems) byTitle[normTitle(p.title)] = p.slug;

  fs.writeFileSync(path.join(OUT_DIR, "local-problem-index.json"), JSON.stringify({ byTitle, problems: problems.map((p) => ({ slug: p.slug, norm: normTitle(p.title), title: p.title })) }, null, 0));

  fs.writeFileSync(
    COVERAGE_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sheetRows: sheet.practiceCount,
        catalogEntries: catalogEntries.length,
        withLocalProblem: catalogEntries.filter((e) => e.localSlug).length,
        missingLocalProblem: missingLocal.length,
        missing: missingLocal,
      },
      null,
      2,
    ),
  );

  console.log(
    JSON.stringify(
      {
        sheet: SHEET_JSON,
        catalog: CATALOG_JSON,
        coverage: COVERAGE_JSON,
        practice: sheet.practiceCount,
        linkedLocal: catalogEntries.filter((e) => e.localSlug).length,
        missingLocal: missingLocal.length,
      },
      null,
      2,
    ),
  );
}

main();
