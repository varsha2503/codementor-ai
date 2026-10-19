# API

All routes are under `/api/v1`. Authenticated routes accept a Bearer token or the HttpOnly session cookie.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Authenticate |
| GET | `/problems` | List and filter problems |
| GET | `/problems/:slug` | Statement and starter code only |
| POST | `/problems/:slug/evaluation-pool` | Screen AI-proposed inputs, then queue reference execution |
| GET | `/problems/:slug/evaluation-pool` | Counts and rejection reasons, without inputs |
| POST | `/submissions/run` | Queue visible and optional custom tests |
| POST | `/submissions` | Queue the full authorized suite |
| GET | `/submissions/:id` | Status, public test summary, and the latest analysis |
| POST | `/ai/hints` | Next hint: `hintLevel`, `hint`, `concept`, `nextStep` |
| GET | `/ai/hints` | Hints already revealed for a problem |
| POST | `/ai/analyze` | Complexity review and one taxonomy classification |
| GET | `/users/me` | Private profile |
| PATCH | `/users/me` | Rename the profile |
| GET | `/users/me/attempts` | Attempt history |
| GET | `/users/me/analytics` | Solved problems, topic accuracy, mistakes |
| GET | `/users/me/recommendations` | Practice suggestions from past results |
| GET | `/health` | Database and queue reachability |

A queued submission responds with `{ "submissionId", "status": "QUEUED" }`. Status then moves through `COMPILING`, `RUNNING`, and `EVALUATING` to a terminal verdict: `ACCEPTED`, `WRONG_ANSWER`, `COMPILE_ERROR`, `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`, `RUNTIME_ERROR`, `CANCELLED`, or `INTERNAL_ERROR`.

Run does not mark a problem solved and may include one custom JSON object. Submit rejects custom input and can update progress. Hidden cases in either response omit input, expected output, and actual output.

Hint level is chosen by the API from the ladder already shown. The model is asked to stay on that level. Analysis returns `estimatedTimeComplexity`, `estimatedSpaceComplexity`, `confidence`, `correctnessConcerns`, `strengths`, `improvements`, and `additionalTestSuggestions`. Classification returns one `category`. `UNKNOWN` is not stored as a recurring mistake.
