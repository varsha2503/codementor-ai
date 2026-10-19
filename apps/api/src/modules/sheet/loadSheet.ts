import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { leetCodeProblemSlugFromUrl } from "../catalog/inspect.js";

export type SheetItemStatus = "solved" | "attempted" | "todo";

export type SheetTrackerItem = {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  tufDifficulty: string | null;
  difficultyLabel: "Easy" | "Medium" | "Hard" | null;
  localSlug: string | null;
  leetcodeUrl: string | null;
  tufUrl: string | null;
  status: SheetItemStatus;
};

export type SheetTrackerSubtopic = {
  name: string;
  solved: number;
  attempted: number;
  practicable: number;
  total: number;
  items: SheetTrackerItem[];
};

export type SheetTrackerTopic = {
  step: number;
  name: string;
  solved: number;
  attempted: number;
  practicable: number;
  total: number;
  subtopics: SheetTrackerSubtopic[];
};

export type SheetTrackerPayload = {
  title: string;
  sourceUrl: string;
  summary: {
    solved: number;
    attempted: number;
    practicable: number;
    total: number;
  };
  topics: SheetTrackerTopic[];
};

type SheetFile = {
  items: {
    tufId: number;
    slug: string;
    title: string;
    section: string;
    sectionPath: string[];
    tufDifficulty?: string;
    leetcodeUrl?: string | null;
    gfgUrl?: string | null;
    tufUrl?: string | null;
    videoUrl?: string | null;
  }[];
};

type CatalogFile = {
  entries: { externalSlug: string; title?: string; localSlug?: string }[];
};

type LocalIndex = {
  byTitle: Record<string, string>;
  problems: { slug: string; norm: string; title: string }[];
};

type SheetLocalOverrides = {
  byNormTitle?: Record<string, string>;
  byTufSlug?: Record<string, string>;
};

type SheetCache = {
  sheet: SheetFile;
  localByExternal: Map<string, string>;
  localIndex: LocalIndex;
  overrides: SheetLocalOverrides;
};

type SubtopicBucket = SheetTrackerSubtopic;
type TopicBucket = {
  name: string;
  subtopicOrder: string[];
  subtopics: Map<string, SubtopicBucket>;
  solved: number;
  attempted: number;
  practicable: number;
  total: number;
};

let cached: SheetCache | null = null;

export function normSheetTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function localSlugFromTitle(title: string, index: LocalIndex, overrides?: SheetLocalOverrides): string | null {
  const normalized = normSheetTitle(title);
  const fromOverride = overrides?.byNormTitle?.[normalized];
  if (fromOverride) return fromOverride;
  const exact = index.byTitle[normalized];
  if (exact) return exact;
  const fuzzy = index.problems.filter((problem) => {
    return problem.norm.includes(normalized) || normalized.includes(problem.norm);
  });
  if (fuzzy.length === 1) return fuzzy[0]?.slug ?? null;
  return null;
}

export function resolveLocalSlug(
  item: SheetFile["items"][number],
  localByExternal: Map<string, string>,
  index: LocalIndex,
  overrides?: SheetLocalOverrides,
): string | null {
  const fromTufOverride = overrides?.byTufSlug?.[item.slug];
  if (fromTufOverride) return fromTufOverride;

  const fromTitle = localSlugFromTitle(item.title, index, overrides);
  if (fromTitle) return fromTitle;

  if (item.leetcodeUrl) {
    const leetcodeSlug = leetCodeProblemSlugFromUrl(item.leetcodeUrl);
    if (leetcodeSlug) {
      const linked = localByExternal.get(leetcodeSlug);
      if (linked) return linked;
    }
  }

  if (item.gfgUrl) {
    const gfgMatch = item.gfgUrl.match(/geeksforgeeks\.org\/problems\/([^/]+)/i);
    const gfgSlug = gfgMatch?.[1] ?? null;
    if (gfgSlug) {
      const linked = localByExternal.get(gfgSlug);
      if (linked) return linked;
    }
  }

  const fromTufSlug = localByExternal.get(item.slug);
  if (fromTufSlug) return fromTufSlug;

  return null;
}

function difficultyLabel(item: SheetFile["items"][number], subtopic: string): "Easy" | "Medium" | "Hard" | null {
  const sub = subtopic.toLowerCase();
  if (sub.includes("easy") && !sub.includes("medium") && !sub.includes("hard")) return "Easy";
  if (sub.includes("hard") || sub.includes("medium")) return "Medium";
  const tuf = (item.tufDifficulty ?? "").toLowerCase();
  if (tuf === "basic" || tuf === "easy") return "Easy";
  if (tuf === "advanced" || tuf === "hard") return "Hard";
  if (tuf === "core") return "Medium";
  return null;
}

function bumpCounts(bucket: { solved: number; attempted: number; practicable: number; total: number }, status: SheetItemStatus, practicable: boolean) {
  bucket.total += 1;
  if (!practicable) return;
  bucket.practicable += 1;
  if (status === "solved") bucket.solved += 1;
  else if (status === "attempted") bucket.attempted += 1;
}

function repoRoot(): string {
  let dir = process.cwd();
  for (let depth = 0; depth < 8; depth += 1) {
    const catalogDir = path.join(dir, "problems/catalog");
    if (
      existsSync(path.join(catalogDir, "striver-a2z.xlsx.json")) ||
      existsSync(path.join(catalogDir, "striver-a2z.sheet.json"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate problems/catalog sheet JSON from the working directory.");
}

function loadSheetFile(root: string): SheetFile {
  const xlsxSheet = path.join(root, "problems/catalog/striver-a2z.xlsx.json");
  const tufSheet = path.join(root, "problems/catalog/striver-a2z.sheet.json");
  const pathToRead = existsSync(xlsxSheet) ? xlsxSheet : tufSheet;
  return JSON.parse(readFileSync(pathToRead, "utf8")) as SheetFile;
}

function loadFiles(): SheetCache {
  if (cached) return cached;
  const root = repoRoot();
  const sheet = loadSheetFile(root);
  const catalog = JSON.parse(readFileSync(path.join(root, "problems/catalog/striver-a2z.json"), "utf8")) as CatalogFile;
  const localIndex = JSON.parse(
    readFileSync(path.join(root, "problems/catalog/local-problem-index.json"), "utf8"),
  ) as LocalIndex;
  const overridesPath = path.join(root, "problems/catalog/sheet-local-overrides.json");
  const overrides = existsSync(overridesPath)
    ? (JSON.parse(readFileSync(overridesPath, "utf8")) as SheetLocalOverrides)
    : {};
  const localByExternal = new Map<string, string>();
  for (const entry of catalog.entries) {
    if (entry.localSlug) localByExternal.set(entry.externalSlug, entry.localSlug);
  }
  cached = { localByExternal, sheet, localIndex, overrides };
  return cached;
}

export function buildSheetTracker(solvedSlugs: Set<string>, attemptedSlugs: Set<string>): SheetTrackerPayload {
  const { sheet, localByExternal, localIndex, overrides } = loadFiles();
  const topicOrder: string[] = [];
  const topics = new Map<string, TopicBucket>();

  for (const item of sheet.items) {
    const topicName = (item.section || item.sectionPath[0] || "Other").trim();
    const subtopicName = (item.sectionPath[1] ?? "Problems").trim();
    const localSlug = resolveLocalSlug(item, localByExternal, localIndex, overrides);
    let status: SheetItemStatus = "todo";
    if (localSlug && solvedSlugs.has(localSlug)) status = "solved";
    else if (localSlug && attemptedSlugs.has(localSlug)) status = "attempted";

    let topic =
      topics.get(topicName) ??
      ({
        name: topicName,
        subtopicOrder: [],
        subtopics: new Map<string, SubtopicBucket>(),
        solved: 0,
        attempted: 0,
        practicable: 0,
        total: 0,
      } satisfies TopicBucket);
    if (!topics.has(topicName)) {
      topicOrder.push(topicName);
      topics.set(topicName, topic);
    }

    if (!topic.subtopics.has(subtopicName)) {
      topic.subtopicOrder.push(subtopicName);
      topic.subtopics.set(subtopicName, {
        name: subtopicName,
        solved: 0,
        attempted: 0,
        practicable: 0,
        total: 0,
        items: [],
      });
    }
    const subtopic = topic.subtopics.get(subtopicName)!;
    const practicable = Boolean(localSlug);

    bumpCounts(subtopic, status, practicable);
    bumpCounts(topic, status, practicable);

    subtopic.items.push({
      id: String(item.tufId),
      title: item.title,
      topic: topicName,
      subtopic: subtopicName,
      tufDifficulty: item.tufDifficulty ?? null,
      difficultyLabel: difficultyLabel(item, subtopicName),
      localSlug,
      leetcodeUrl: item.leetcodeUrl ?? null,
      tufUrl: item.tufUrl ?? null,
      status,
    });
  }

  const orderedTopics: SheetTrackerTopic[] = topicOrder.map((name, index) => {
    const topic = topics.get(name)!;
    return {
      step: index + 1,
      name: topic.name,
      solved: topic.solved,
      attempted: topic.attempted,
      practicable: topic.practicable,
      total: topic.total,
      subtopics: topic.subtopicOrder.map((subName) => topic.subtopics.get(subName)!),
    };
  });

  let solved = 0;
  let attempted = 0;
  let practicable = 0;
  let total = 0;
  for (const topic of orderedTopics) {
    solved += topic.solved;
    attempted += topic.attempted;
    practicable += topic.practicable;
    total += topic.total;
  }

  return {
    title: "Striver A2Z DSA Sheet",
    sourceUrl: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    summary: { solved, attempted, practicable, total },
    topics: orderedTopics,
  };
}
