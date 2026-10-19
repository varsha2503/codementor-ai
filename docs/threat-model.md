# Threat model

Candidate code is treated as hostile, including code from a signed-in local user.

The API accepts at most 64KB of source, rejects a null byte, and rejects a candidate-defined `main`. It checks the account, the language, and a per-minute rate limit, then enqueues the job. The API process does not call `exec` or `child_process` on that source.

The judge writes each job into its own temporary directory and starts `codementor-runner:1` with:

- a fixed compiler image and `--pull never`
- no network
- a read-only root filesystem and small tmpfs mounts
- non-root user 1000
- dropped capabilities and `no-new-privileges`
- CPU, memory, swap, and pid limits
- a wall-clock timeout around the container, plus `timeout` and `ulimit` inside it
- bounded stdout, stderr, and compile output

The container does not receive the Docker socket, host credentials, or application secrets. The worker deletes the container and the job directory afterward. Jobs stuck in `RUNNING` or `QUEUED` are marked `INTERNAL_ERROR` so they do not stay open.

The model never sees hidden inputs. It is instructed not to claim that code ran, or that tests passed, unless the execution summary says so. Generated inputs are schema-checked, constraint-checked, deduplicated, and executed with the private reference solution before they can enter the evaluation pool. They are not added to the grading suite.

A container is a local prototype, not a complete boundary for public multi-tenant execution. Before accepting arbitrary public submissions, move the runner to a stronger sandbox such as gVisor or a microVM and keep this service off the public network until that isolation has been reviewed.
