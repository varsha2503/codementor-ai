import type { PrismaClient } from "@prisma/client";
import { linkLocalProblem, type CatalogDraft, type LocalProblemRef } from "./inspect.js";

export async function storeCatalogDrafts(prisma: PrismaClient, drafts: CatalogDraft[], localProblems: LocalProblemRef[]) {
  const saved = [];
  for (const draft of drafts) {
    const existing = await prisma.problemCatalogEntry.findUnique({
      where: { source_externalSlug: { source: draft.source, externalSlug: draft.externalSlug } },
      select: { problemId: true },
    });
    const link = linkLocalProblem(draft, localProblems, existing?.problemId ?? null);
    const problem = link.problemSlug
      ? await prisma.problem.findUnique({ where: { slug: link.problemSlug }, select: { id: true } })
      : link.note === "keep-existing" && existing?.problemId
        ? { id: existing.problemId }
        : null;
    const row = await prisma.problemCatalogEntry.upsert({
      where: { source_externalSlug: { source: draft.source, externalSlug: draft.externalSlug } },
      create: {
        source: draft.source,
        externalSlug: draft.externalSlug,
        externalId: draft.externalId,
        title: draft.title,
        difficulty: draft.difficulty,
        topics: draft.topics,
        tags: draft.tags,
        canonicalUrl: draft.canonicalUrl,
        licenseStatus: problem ? "LOCAL_STATEMENT" : "LINK_ONLY",
        permissionNote: link.note && link.note !== "keep-existing" ? `${draft.permissionNote} ${link.note}` : draft.permissionNote,
        attribution: draft.attribution,
        importStatus: "IMPORTED",
        importedAt: new Date(),
        problemId: problem?.id ?? null,
      },
      update: {
        externalId: draft.externalId,
        title: draft.title,
        difficulty: draft.difficulty,
        topics: draft.topics,
        tags: draft.tags,
        canonicalUrl: draft.canonicalUrl,
        licenseStatus: problem ? "LOCAL_STATEMENT" : "LINK_ONLY",
        permissionNote: link.note && link.note !== "keep-existing" ? `${draft.permissionNote} ${link.note}` : draft.permissionNote,
        attribution: draft.attribution,
        importStatus: "IMPORTED",
        rejectionReason: null,
        importedAt: new Date(),
        problemId: problem?.id ?? null,
      },
    });
    saved.push({ externalSlug: row.externalSlug, licenseStatus: row.licenseStatus, linked: Boolean(row.problemId) });
  }
  return saved;
}
