# Catalog imports (metadata and links only)

CodeMentor stores **titles, difficulty, tags, canonical URLs, and optional links to local problems**. It does **not** import problem statements, examples, constraints, editorials, or solutions from LeetCode or GeeksforGeeks.

## Sources

| Source | `source` value | Canonical URL |
| --- | --- | --- |
| LeetCode | `leetcode` | `https://leetcode.com/problems/<slug>/description/` |
| GeeksforGeeks | `geeksforgeeks` | `https://www.geeksforgeeks.org/problems/<slug>/` |

Third-party terms do not grant permission to copy full problem text. Treat anything beyond metadata as **unlicensed** unless you have a separate agreement.

## Striver A2Z sheet

**Preferred:** import `dsa-problem-lists.xlsx` (topic, subtopic, LeetCode/GFG/TUF links). The app sheet API reads `striver-a2z.xlsx.json` when present.

```bash
npm run sheet:import-xlsx
```

Legacy: build from the public takeuforward page (`striver-a2z.sheet.json`).

```bash
npm run catalog:build-striver
# or: tsx scripts/buildStriverCatalog.ts --fetch --probe
```

Outputs:

- `striver-a2z.sheet.json` — sheet titles, sections, and outbound links from takeuforward
- `striver-a2z.json` — import-ready catalog entries
- `striver-a2z.unresolved.json` — rows that need a manual slug override
- `local-problem-index.json` — maps sheet titles to CodeMentor `Problem.slug` for the in-app sheet tracker
- `sheet-local-overrides.json` — manual Striver title / TUF slug → `Problem.slug` when names differ from manifests

## File format

See `leetcode.sample.json`. Top-level keys:

- `source`: optional legacy default (`leetcode` or `geeksforgeeks`); prefer `source` on each entry for mixed files
- `permission`: short note (20–500 chars) explaining why only metadata is stored
- `entries`: array (max 500 per file)

Each entry:

- `source` — `leetcode` or `geeksforgeeks` (required if file-level `source` is omitted)
- `externalSlug` — platform slug (e.g. `two-sum`)
- `title`, `difficulty` (`EASY` | `MEDIUM` | `HARD`)
- `topics`, `tags` — string arrays
- `canonicalUrl` — public problem URL whose slug matches `externalSlug`
- `externalId` — optional numeric LeetCode id (`leetcode` only)
- `localSlug` — optional link to a CodeMentor `Problem.slug` when you already have an authorized local statement

## Import

After migrations and seed:

```bash
npm run db:migrate
npm run catalog:import -- problems/catalog/leetcode.sample.json
npm run catalog:import -- problems/catalog/striver-a2z.json
```

Rejected rows are printed to stderr. Accepted rows are upserted on `(source, externalSlug)`.

## Verify terms are respected

1. Import a file that includes a `statement` field — the importer must reject it (`inspect.test.ts`).
2. Open **Catalog** in the app — entries show title and link, not LeetCode prose.
3. Open a `LINK_ONLY` entry — **Open original problem** goes to LeetCode; interview uses a notice instead of a stored statement; Run/Submit are not graded.
4. Open a linked entry — **Practice local statement** goes to `/problems/<localSlug>` with your manifest text and the judge.
