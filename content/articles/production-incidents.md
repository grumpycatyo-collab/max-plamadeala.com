---
title: "Lessons from hundreds of production incidents"
publishDate: 2026-03-05
description: "Patterns that repeated across incidents involving third-party APIs, retries, data consistency, and permissions."
slug: "production-incidents"
featured: true
topic: "Reliability"
---

After enough incidents, the specifics stop mattering as much as the shape. Different systems,
different root causes, but the same handful of patterns kept showing up.

## Most incidents are a retry doing the wrong thing

A retry that isn't idempotent-aware turns a transient failure into duplicated side effects. A
retry without backoff turns a struggling downstream into a dead one. A retry with no ceiling
turns a five-minute blip into an hours-long incident because the queue behind it never drains.
Almost every "the system fell over" incident I've worked had a retry policy somewhere that was
either too aggressive, not idempotent, or both.

The fix is rarely removing retries — it's making them boring: bounded attempts, exponential
backoff with jitter, and a clear idempotency key so a retried operation is provably safe to
repeat.

## Third-party APIs fail in ways your tests don't cover

Your test suite exercises the failure modes you thought of. Production exercises the ones you
didn't: a 200 response with an empty body, a rate limit that kicks in exactly at your peak
traffic hour, an auth token that silently stops working without an error until three calls later.
The incidents that took longest to resolve were almost always the ones where the third party
"succeeded" in a way that was subtly wrong, not the ones where it obviously failed.

Treating "unexpected but technically 200" as a first-class failure mode — with the same
alerting and validation as an actual error — closed most of that gap.

## Permissions incidents hide until someone hits them

A permissions bug rarely triggers broadly. It sits quiet until the one user, the one tenant, the
one role combination that exercises it — often months after the code shipped. By the time it's
reported, nobody remembers the change that caused it.

The mitigation that actually helped wasn't more code review — it was better observability
specifically around authorization decisions (who was denied, and why, logged structurally), so
when the report came in, the answer was a query, not an archaeology project through git blame.

## Data consistency incidents are usually a missing invariant, not a missing lock

More often than a race condition, the real bug was an invariant nobody had written down: "a sync
job and a manual edit should never both be allowed to write this field," for instance. Once that
invariant was explicit, enforcing it (with a lock, a version check, whatever) was the easy part.
Most of the time spent on these incidents was spent figuring out what should have been true, not
implementing the mechanism that keeps it true.

## What actually reduces incident volume

Not a single heroic fix — a compounding set of boring ones: idempotent retries everywhere,
treating "wrong but 200" as a failure, structured logs around anything security-sensitive, and
writing down invariants before writing the code that's supposed to enforce them. None of that is
exciting. All of it is the difference between an incident being a five-minute non-event and a
multi-hour one.
