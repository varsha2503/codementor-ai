# CodeMentor AI

Coding interview practice for C++17. The execution worker decides whether a solution passes. The model explains, hints, and estimates complexity. It is not allowed to be the judge.

## What the first version includes

- Accounts, with a private profile
- 422 original problems across basics, sorting, arrays, strings, binary search, sliding window, linked lists, trees, binary search trees, graphs, recursion, bit manipulation, stacks and queues, heaps, greedy, dynamic programming, and tries
- A Monaco workspace with separate Run and Submit actions
- An isolated Docker runner for compilation, tests, and resource limits
- A four-level hint ladder
- Complexity and code review, with schema-checked model output
- Attempt history
- A progress view for topic accuracy, hint use, and recurring mistake categories

Python, Java, live interviews, and a custom recommendation model are intentionally out of scope.

## Run it locally

Requirements: Node 20+, Docker.

```bash
bash scripts/setup.sh
npm run dev
```

Open http://localhost:5173.

The seed account is `ada@codementor.local` / `practice-locally`. Change `JWT_SECRET` in `.env` before anyone else can reach the machine.

`npm run dev` starts the API on port 4000, the worker, and the Vite app. Postgres and Redis come from Docker Compose. The worker starts sibling containers from the local image `codementor-runner:1`. That image has no network, drops capabilities, and does not receive the Docker socket or application secrets.

To check every reference solution against the seeded tests:

```bash
npm run self-check
```

Unit tests that do not need Docker:

```bash
npm test
```

## Layout

`apps/web` is the React workspace. `apps/api` is the modular API. `workers/judge` compiles and grades C++ in Docker. `packages/shared` holds the Zod contracts, mistake taxonomy, and progress rules. Problem text lives in `problems/manifests`, and the extra stress fixture lives in `problems/test-fixtures`. Design notes are in `docs/`.

## LeetCode catalog (metadata and links)

The **Catalog** nav item lists external problems without replacing the 422 local manifests in `problems/manifests/`.

- **Stored:** title, difficulty, topics, tags, canonical LeetCode URL, external slug/id, source, license status, import status, permission note, optional link to a local `Problem`.
- **Not imported:** statements, examples, constraints, editorials, or solutions. The importer rejects those fields.
- **LINK_ONLY:** show metadata, **Open original problem**, and a catalog interview that tells the candidate to read the statement on LeetCode. Monaco is available for notes; the isolated judge does not grade catalog-only sessions.
- **LOCAL_STATEMENT:** when `localSlug` matches a seeded problem, the catalog entry links to `/problems/<slug>` for full practice, hints, Run, and Submit.

There is no scraper. You supply JSON (see `problems/catalog/README.md` and `leetcode.sample.json`):

```bash
npm run catalog:import -- problems/catalog/leetcode.sample.json
```

API: `GET /api/v1/catalog`, `GET /api/v1/catalog/:source/:slug`, catalog interview under `/api/v1/catalog/:source/:slug/interview`.

## How a submission moves

1. The API checks the account, the language, the code policy, and the rate limit.
2. It stores an attempt and enqueues a job. The response is `{ submissionId, status: "QUEUED" }`.
3. The worker compiles and runs the code in the runner container. The API process never calls the candidate binary.
4. Hidden cases are compared inside the worker. The stored summary keeps their inputs, expected outputs, and actual outputs off the response.
5. The workspace polls `GET /api/v1/submissions/:id` about once a second.
6. Analysis, if you ask for it, receives the problem, your code, and that public summary.

Run uses the visible examples and may include one custom JSON input. It does not mark a problem solved. Submit runs the full suite and can.

## Models

Leave `LLM_API_KEY` empty to use the built-in interviewer. It walks introduction, understanding, approach, coding, complexity, and feedback, follows the authored hint ladder, and makes conservative complexity guesses. Set `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` to any OpenAI-compatible chat API. Responses are checked with Zod, and a reply that skips a stage or pastes an implementation is discarded. If the model response does not match, the built-in interviewer is used instead. The runner remains the judge. The workspace can also listen with the browser's speech recognition and speak replies with `speechSynthesis`. That speech path uses the browser's own speech service.

Generated tests are screened against the problem constraints, deduplicated, and only then executed with the private reference solution. Accepted cases go into an evaluation pool. They are not added to the grading suite.

## Limits of the sandbox

The runner is a local prototype. A container with dropped capabilities and no network is not a complete boundary for hostile code on a public multi-tenant service. Before exposing submissions to the internet, move execution to something like gVisor or a microVM and keep this service off the public network until that isolation has been reviewed.
