---
title: "Enterprise SaaS integrations at scale"
slug: "enterprise-integrations"
oneLiner: "Owning 35+ SaaS integrations across 100+ enterprise tenants, and the incident process that kept them trustworthy."
role: "Backend engineer, integrations & reliability"
stack: ["Python", "REST/SOAP APIs", "Celery", "PostgreSQL", "Datadog"]
result: "MTTR -35%"
order: 1
---

## Overview

Enterprise buyers don't just want your product — they want it wired into whatever they already
run: their CRM, their HR system, their identity provider, their billing platform. Over two years
I owned the integration layer connecting our platform to 35+ external SaaS systems, used across
more than 100 enterprise tenants, each with its own auth model, rate limits, and quirks.

## Context

Every tenant expected their integration to "just work," but every third-party API had its own
idea of reliable: some rate-limited aggressively, some rotated credentials without warning, some
returned malformed payloads under load. The integration layer sat directly in customer-facing
workflows, so a broken sync wasn't a background job failure — it was a support ticket, and often
an angry one.

## Problem

Failures were frequent, varied, and mostly invisible until a customer noticed. There was no
consistent way to tell "this integration is degraded" from "this integration is down," and no
shared playbook for triaging a failure across 35 different external systems maintained by
different teams over time.

## Constraints

- Zero tolerance for silently dropping customer data mid-sync.
- Each external API had its own auth flow, pagination model, and failure semantics — no single
  client library could cover all of them cleanly.
- Enterprise tenants expected predictable behavior even when the *external* system was flaky,
  which meant our reliability ceiling was capped by systems we didn't control.
- Limited headcount relative to integration count — this had to be operable by whoever was on
  call, not just the person who built a given connector.

## Approach

I standardized the integration layer around a common contract: every connector implements the
same retry, backoff, and dead-letter interface regardless of the upstream API's shape. Sync jobs
run through Celery with per-tenant queues, so one tenant's flaky integration can't starve
another's. Every integration emits the same structured events (`sync.started`, `sync.failed`,
`sync.degraded`) into Datadog, so triage doesn't require knowing the specific connector's
internals — just the shared vocabulary.

On top of that, I built a lightweight incident runbook per failure class (auth expired, rate
limited, schema drift, timeout) so on-call could act on symptoms rather than needing tribal
knowledge of 35 separate systems.

## Technical decisions

- **A shared retry/backoff contract, not a shared client.** Trying to force every external API
  behind one abstraction produced leaky abstractions in earlier attempts. Standardizing the
  *behavior* (retry policy, idempotency, dead-lettering) instead of the *transport* let each
  connector stay simple while the operational story stayed consistent.
- **Per-tenant queue isolation.** A single noisy or degraded integration should never delay
  syncs for tenants unaffected by it — this made tenant-level queues non-negotiable even though
  it added operational surface area.
- **Structured events over ad-hoc logging.** Free-text logs don't scale past a handful of
  integrations; a small fixed vocabulary of event types made dashboards and alerting reusable
  across all 35+ connectors instead of bespoke per integration.

## Challenges

The hardest failures weren't outages — they were *silent degradations*: an API that kept
returning 200s with subtly wrong data after a schema change on their end. Retry logic doesn't
help when the request "succeeds." That pushed us toward adding lightweight schema validation at
the ingestion boundary of every connector, so drift became a loud, immediate failure instead of a
slow, quiet one discovered days later by a customer.

## Results

- Handled and learned from 300+ production incidents across the integration surface.
- Reduced mean time to recovery by 35% by replacing ad-hoc debugging with symptom-based runbooks
  and consistent structured events.
- Reduced recurring Snowflake-related integration failures by 60% (see the
  [Snowflake extraction](/work/snowflake-extraction) case study for the pipeline-side half of
  that work).

## Lessons

Reliability at this scale is mostly an operability problem, not a code problem — the connector
code was rarely the hard part; making 35 different failure modes legible to whoever was on call
was. If I rebuilt this today, I'd invest in schema-drift detection even earlier, since it was the
failure class that cost the most time relative to how simple the eventual fix was.
