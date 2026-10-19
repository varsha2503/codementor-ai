# Database

PostgreSQL holds the application data. Prisma schema lives in `prisma/schema.prisma`, and migrations start at `prisma/migrations`.

`User` has many `Attempt` rows. `Problem` has many attempts, test cases, and evaluation cases. A problem also stores the private driver, reference solution, and hint ladder. Those fields are excluded from the problem API.

`Attempt` keeps the submitted source, language, problem version, verdict, runtime, memory, and a public test summary. `ExecutionJob` tracks `QUEUED`, `COMPILING`, `RUNNING`, `EVALUATING`, and the terminal status, plus the queue id and failure code.

`AIInteraction` stores each hint, analysis, and classification with the model name. Hint rows also store the ladder level. `AttemptIssue` stores a taxonomy category, severity, confidence, and the evidence text. `UNKNOWN` is not inserted.

`TestCase` rows are the grading suite. `visibility` is `SAMPLE` or `HIDDEN`. `EvaluationCase` rows are the separate pool filled only after a reference run accepts an input. They are not used to grade a candidate.

Indexes cover `Attempt(userId, createdAt)`, `Attempt(problemId, userId)`, `ExecutionJob(status, createdAt)`, and `TestCase(problemId, visibility, ordinal)`.

Problem statements and official tests are authored in `problems/manifests`. The extra pair-target stress case lives in `problems/test-fixtures` and is merged at seed time.
