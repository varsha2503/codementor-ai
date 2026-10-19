export const FORBIDDEN_CATALOG_FIELDS = [
  "statement",
  "description",
  "content",
  "examples",
  "constraints",
  "editorial",
  "solution",
  "solutions",
  "starterCode",
  "driverCode",
  "referenceSolution",
  "hint",
  "hints",
  "hintLadder",
] as const;

export const CATALOG_SOURCES = ["leetcode", "geeksforgeeks"] as const;
export type CatalogSource = (typeof CATALOG_SOURCES)[number];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LEETCODE_URL =
  /^https:\/\/leetcode\.com\/problems\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/(?:description|solution|submissions|discuss|editorial))?\/?(?:\?.*)?$/i;
const GFG_URL =
  /^https:\/\/(?:www\.)?geeksforgeeks\.org\/problems\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/[0-9]+)?\/?(?:\?.*)?$/i;

export function leetCodeDescriptionUrl(externalSlug: string): string {
  return `https://leetcode.com/problems/${externalSlug}/description/`;
}

export function geeksforgeeksProblemUrl(externalSlug: string): string {
  return `https://www.geeksforgeeks.org/problems/${externalSlug}/1`;
}

export function parseLeetCodeProblemUrl(url: string): string | null {
  const trimmed = url.trim().split("#", 1)[0] ?? "";
  const match = LEETCODE_URL.exec(trimmed);
  return match?.[1]?.toLowerCase() ?? null;
}

/** Slug from a LeetCode URL, or null when the link is not a direct problem page (e.g. /discuss/). */
export function leetCodeProblemSlugFromUrl(url: string): string | null {
  const trimmed = url.trim().split("#", 1)[0] ?? "";
  if (/\/discuss\//i.test(trimmed)) return null;
  const match = /leetcode\.com\/problems\/([a-z0-9]+(?:-[a-z0-9]+)*)/i.exec(trimmed);
  const slug = match?.[1]?.toLowerCase();
  return slug && SLUG.test(slug) ? slug : null;
}

export function parseGeeksforgeeksProblemUrl(url: string): string | null {
  const match = GFG_URL.exec(url.trim());
  return match?.[1]?.toLowerCase() ?? null;
}

export type CatalogDraft = {
  source: string;
  externalSlug: string;
  externalId: string | null;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
  tags: string[];
  canonicalUrl: string;
  localSlug: string | null;
  permissionNote: string;
  attribution: string;
};

export type CatalogRejection = { index: number; externalSlug: string | null; reason: string };

export type LocalProblemRef = { slug: string; title: string };

const MAX_ENTRIES_PER_FILE = 500;

export function inspectCatalogFile(raw: unknown, localProblems: LocalProblemRef[]): { accepted: CatalogDraft[]; rejected: CatalogRejection[] } {
  const rejected: CatalogRejection[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { accepted: [], rejected: [{ index: -1, externalSlug: null, reason: "Catalog file must be an object." }] };
  }
  const file = raw as Record<string, unknown>;
  const leaked = FORBIDDEN_CATALOG_FIELDS.find((field) => field in file);
  if (leaked) {
    return { accepted: [], rejected: [{ index: -1, externalSlug: null, reason: `Remove "${leaked}". This import stores metadata and links only.` }] };
  }
  const fileSourceDefault =
    file.source === undefined ? null : typeof file.source === "string" && CATALOG_SOURCES.includes(file.source as CatalogSource) ? (file.source as CatalogSource) : null;
  if (file.source !== undefined && !fileSourceDefault) {
    return {
      accepted: [],
      rejected: [{ index: -1, externalSlug: null, reason: `source must be one of: ${CATALOG_SOURCES.join(", ")} (or omit for per-entry source).` }],
    };
  }
  const permissionNote = typeof file.permission === "string" ? file.permission.trim() : "";
  if (permissionNote.length < 20 || permissionNote.length > 500) {
    return { accepted: [], rejected: [{ index: -1, externalSlug: null, reason: "permission must explain why only metadata and links are stored." }] };
  }
  if (!Array.isArray(file.entries)) {
    return { accepted: [], rejected: [{ index: -1, externalSlug: null, reason: "entries must be an array." }] };
  }
  if (file.entries.length > MAX_ENTRIES_PER_FILE) {
    return { accepted: [], rejected: [{ index: -1, externalSlug: null, reason: `Import at most ${MAX_ENTRIES_PER_FILE} entries per file.` }] };
  }
  const accepted: CatalogDraft[] = [];
  const seen = new Set<string>();
  file.entries.forEach((entry, index) => {
    const draft = inspectEntry(entry, index, permissionNote, localProblems, seen, fileSourceDefault);
    if ("reason" in draft) rejected.push(draft);
    else accepted.push(draft);
  });
  return { accepted, rejected };
}

function inspectEntry(
  entry: unknown,
  index: number,
  permissionNote: string,
  localProblems: LocalProblemRef[],
  seen: Set<string>,
  fileSourceDefault: CatalogSource | null,
): CatalogDraft | CatalogRejection {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { index, externalSlug: null, reason: "Entry must be an object." };
  }
  const record = entry as Record<string, unknown>;
  const leaked = FORBIDDEN_CATALOG_FIELDS.find((field) => field in record);
  if (leaked) {
    return { index, externalSlug: slugOf(record), reason: `Refuse "${leaked}". Full statements, examples, constraints, and solutions are not imported.` };
  }
  const entrySourceRaw = record.source !== undefined ? record.source : fileSourceDefault;
  if (typeof entrySourceRaw !== "string" || !CATALOG_SOURCES.includes(entrySourceRaw as CatalogSource)) {
    return { index, externalSlug: slugOf(record), reason: `source must be one of: ${CATALOG_SOURCES.join(", ")}.` };
  }
  const source = entrySourceRaw as CatalogSource;
  const externalSlug = slugOf(record);
  if (!externalSlug || !SLUG.test(externalSlug)) {
    return { index, externalSlug, reason: "externalSlug must be a lowercase kebab-case slug." };
  }
  const dedupeKey = `${source}:${externalSlug}`;
  if (seen.has(dedupeKey)) {
    return { index, externalSlug, reason: "Duplicate source + externalSlug in this file." };
  }
  seen.add(dedupeKey);
  const canonicalUrl = typeof record.canonicalUrl === "string" ? record.canonicalUrl.trim() : "";
  const urlSlug = source === "leetcode" ? parseLeetCodeProblemUrl(canonicalUrl) : parseGeeksforgeeksProblemUrl(canonicalUrl);
  if (!urlSlug || urlSlug !== externalSlug) {
    return {
      index,
      externalSlug,
      reason:
        source === "leetcode"
          ? "canonicalUrl must be a LeetCode problem link whose slug matches externalSlug (e.g. …/problems/<slug>/ or …/problems/<slug>/description/)."
          : "canonicalUrl must be a GeeksforGeeks problem link whose slug matches externalSlug (e.g. …/problems/<slug>/).",
    };
  }
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (title.length < 1 || title.length > 180) return { index, externalSlug, reason: "title is required." };
  const difficulty = record.difficulty;
  if (difficulty !== "EASY" && difficulty !== "MEDIUM" && difficulty !== "HARD") {
    return { index, externalSlug, reason: "difficulty must be EASY, MEDIUM, or HARD." };
  }
  const topics = stringList(record.topics);
  const tags = stringList(record.tags);
  if (!topics || !tags) return { index, externalSlug, reason: "topics and tags must be short string lists." };
  let externalId: string | null = null;
  if (source === "leetcode") {
    externalId = typeof record.externalId === "string" && /^[0-9]{1,12}$/.test(record.externalId) ? record.externalId : null;
    if (record.externalId !== undefined && externalId === null) {
      return { index, externalSlug, reason: "externalId must be a numeric LeetCode question id when present." };
    }
  } else if (record.externalId !== undefined) {
    return { index, externalSlug, reason: "externalId is only supported for leetcode entries." };
  }
  let localSlug: string | null = null;
  if (record.localSlug !== undefined && record.localSlug !== null) {
    if (typeof record.localSlug !== "string" || !SLUG.test(record.localSlug)) {
      return { index, externalSlug, reason: "localSlug must be an existing CodeMentor problem slug." };
    }
    if (!localProblems.some((problem) => problem.slug === record.localSlug)) {
      return { index, externalSlug, reason: `No local problem with slug ${record.localSlug}.` };
    }
    localSlug = record.localSlug;
  }
  const normalizedCanonical = source === "leetcode" ? leetCodeDescriptionUrl(externalSlug) : geeksforgeeksProblemUrl(externalSlug);
  const attribution =
    source === "leetcode"
      ? "Title and link point at the problem on LeetCode. CodeMentor does not store that site's statement."
      : "Title and link point at the problem on GeeksforGeeks. CodeMentor does not store that site's statement.";
  return {
    source,
    externalSlug,
    externalId,
    title,
    difficulty,
    topics,
    tags,
    canonicalUrl: normalizedCanonical,
    localSlug,
    permissionNote,
    attribution,
  };
}

function slugOf(record: Record<string, unknown>): string | null {
  return typeof record.externalSlug === "string" ? record.externalSlug.trim().toLowerCase() : null;
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 8) return null;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0 && item.trim().length <= 40);
  if (items.length !== value.length) return null;
  return items.map((item) => item.trim());
}

export function linkLocalProblem(draft: CatalogDraft, localProblems: LocalProblemRef[], existingProblemId: string | null): { problemSlug: string | null; note: string | null } {
  if (draft.localSlug) return { problemSlug: draft.localSlug, note: null };
  if (existingProblemId) return { problemSlug: null, note: "keep-existing" };
  const matches = localProblems.filter((problem) => problem.title.toLowerCase() === draft.title.toLowerCase());
  if (matches.length === 1) return { problemSlug: matches[0]?.slug ?? null, note: null };
  if (matches.length > 1) return { problemSlug: null, note: "Several local problems share this title, so none was linked." };
  return { problemSlug: null, note: null };
}
