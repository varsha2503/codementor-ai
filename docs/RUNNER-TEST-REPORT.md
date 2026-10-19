# Multi-language runner test report

This document describes how CodeMentor validates **C++17**, **Java**, and **Python 3** runners, what is automated in CI vs locally, and how to produce measured results.

## Pipeline differences (by design)

| Stage | C++ | Java | Python 3 |
|-------|-----|------|----------|
| Compile | `g++ -std=c++17` → `/tmp/prog` | `javac` Support + Solution + Main | `python3 -m py_compile` (syntax check) |
| Run | `/tmp/prog` | `java -cp /tmp/classes Main` | `python3 /src/main.py` |
| Entry point | Generated `main.cpp` | Generated `Main.java` | Generated `main.py` |
| User code file | `solution.cpp` | `Solution.java` | `solution.py` |
| Compile failure verdict | `COMPILE_ERROR` (API) | same | same (syntax via py_compile) |

Python has **no native binary compile**; Java/C++ share a compile-then-run shell script in the runner container.

## Automated tests in repo

| Suite | Command | Docker required |
|-------|---------|-----------------|
| Shared language policy | `npm run test:shared` | No |
| Worker pipeline (static) | `npm run test:worker` | No |
| Worker Docker integration | `npm run test:runner:integration` | Yes + `codementor-runner:1` |
| JSON report | `npm run test:runner:report` | Yes |
| API language enqueue | `npm run test:api` | No (mocked) |
| Web language labels | `npm run test:web` | No |
| k6 load (staging) | see `scripts/load/README.md` | Real API + worker for runner tests |

### Enable Docker integration tests

```bash
npm run runner:build
RUNNER_INTEGRATION=1 npm run test:runner:integration
RUNNER_INTEGRATION=1 npm run test:runner:report
```

When Docker or the image is missing, integration tests are **skipped** (not failed). The report script writes `docs/RUNNER-TEST-RESULTS.json` with a `blocked` array.

## Test coverage map

### 1. Language smoke tests

Implemented in `workers/judge/tests/runIntegrationTests.ts` and `workers/judge/tests/reportRunner.ts`:

- Valid program + JSON stdin/stdout
- Compile/syntax errors → `compileOk: false`, no graded cases
- Wrong output → run OK, JSON mismatch (WA at job layer)
- Runtime error
- Timeout (infinite loop, short `timeLimitMs`)
- Multiple cases + boundary `n = 1_000_000_000`
- Tool versions via `docker run … g++ --version`, `javac -version`, `python3 --version`

### 2. Shared functional scenarios

Fixtures: `workers/judge/tests/fixtures/countDigits.ts` (controlled programs, no destructive payloads).

| Scenario | C++ | Java | Python |
|----------|-----|------|--------|
| Valid solution | yes | yes | yes |
| Wrong output | yes | yes | yes |
| Syntax/compile error | yes | yes | yes |
| Runtime error | yes | yes | yes |
| Timeout | yes | yes | yes |
| Multiple / boundary cases | yes | yes | yes |
| Excessive stdout | yes | yes | yes |
| Empty input `{}` | manual / extend | missing key → runtime | same |
| Memory stress | not in CI (optional manual) | optional manual | optional manual |
| Concurrent jobs | yes (parallel `runInSandbox`) | shared | shared |

### 3. Cross-language correctness

Same `count-digits` inputs; outputs compared with `outputsMatch` / JSON equality across all three languages.

### 4. Pipeline & security (static review + tests)

`workers/judge/src/pipeline.test.ts` and executor source checks:

- Language selected server-side in `runInSandbox` / `executeAttempt`
- User code written to fixed paths; not concatenated into shell
- Docker: `--network none`, `--read-only`, `--cap-drop ALL`, memory/pids limits (`limits.ts`)
- **Finding:** security depends on Docker isolation; misconfiguration of socket or `--privileged` would be critical — do not run worker with elevated privileges.

### 5. Resource limits

Runner container per job: 768m RAM, 1 CPU, ulimit/timeouts in `run.sh`. Language-specific stress tests are **not** run in default CI (safe portfolio); run manually in disposable VM only.

### 6. Load testing

`scripts/load/` — health, per-language submit, concurrent, ramp, stress. Separates:

- **API latency** — k6 HTTP metrics
- **Queue/runner** — requires polling submission status; worker concurrency defaults to **1** in `consumer.ts`

Use real execution on staging; mock Redis/DB only for pure API unit tests.

### 7. Regression (API + web)

- API persists `language` on attempt (python3/java tests in `routes.test.ts`)
- Web Monaco + labels (`languages.test.ts`)
- E2E Playwright for language selector + run UI — **recommended next step** (not yet in repo)

## Latest measured results

> Run locally and paste or commit `docs/RUNNER-TEST-RESULTS.json` after `npm run test:runner:report`.

Until that file is generated on your machine, **no language is marked as Docker-verified in CI**.

## Commands cheat sheet

```bash
# Unit / static (CI-safe)
npm test

# Docker integration
npm run runner:build
RUNNER_INTEGRATION=1 npm run test:runner:integration

# Report artifact
RUNNER_INTEGRATION=1 npm run test:runner:report

# Reference solutions (DB + all problems, C++ only today)
npm run self-check

# k6 (staging)
export API_BASE=... AUTH_TOKEN=...
k6 run scripts/load/submit-one-per-language.js
```

## Definition of done checklist

- [x] Automated smoke + functional fixtures for three languages (Docker-gated)
- [x] Cross-language count-digits parity test
- [x] Pipeline/security static tests
- [x] API + web language regression tests
- [x] k6 scripts per language + mixed load
- [ ] Playwright E2E language switch + run (optional follow-up)
- [ ] Commit `RUNNER-TEST-RESULTS.json` from your environment after green report
