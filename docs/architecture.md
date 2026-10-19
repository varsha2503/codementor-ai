# Architecture

CodeMentor is a modular monolith plus one isolated execution worker.

The React app talks to the Node API over HTTPS JSON. The API owns accounts, problems, attempts, hint orchestration, and analytics. It never compiles or runs candidate code. It writes an attempt, enqueues a job on Redis, and returns a submission id. The browser polls until the verdict is terminal.

The judge worker is the only process that starts a container. It compiles C++17, runs the binary against authorized tests, and returns bounded results. Comparison happens in the worker, outside the sandbox. Hidden inputs and expected outputs are stripped before they are stored on the attempt the client can read.

The model is called only after that boundary. It receives the problem, the candidate's code, and a public execution summary. It does not receive permission to run commands, and its output is checked with Zod before it is stored. If the response does not match, the built-in heuristic coach is used instead.

Postgres is the source of truth. Redis holds the BullMQ queue and short-lived rate limits. One worker process is enough for local use. More worker replicas can share the same queue later.
