---
title: "High-volume Snowflake extraction"
slug: "snowflake-extraction"
oneLiner: "Redesigning extraction so 10,000+ row queries stopped timing out, failing, and quietly costing more than they should."
role: "Backend engineer, data infrastructure"
stack: ["Python", "Snowflake", "S3", "Airflow"]
result: "Extraction cost -60%"
order: 2
---

## Overview

A recurring reporting workflow needed to pull large result sets — often 10,000+ rows — out of
Snowflake and hand them off to downstream systems. It worked fine at small scale and fell over at
large scale, in the specific way that "fine in dev, expensive and flaky in production" workflows
usually do.

## Context

The extraction ran on a schedule via Airflow, feeding tenant-facing reports and internal
analytics. As query result sizes grew, so did the failure rate: timeouts, dropped connections
mid-transfer, and Snowflake credits burning on retried queries that failed at the *last* step of
a long-running job.

## Problem

Large queries were pulled through a single synchronous connection and materialized in memory
before being written out. Past a certain row count, that connection was likely to drop before the
query finished — and when it did, the entire query re-ran from scratch, including all the compute
already paid for.

## Constraints

- Snowflake compute cost is metered — retrying a full 10,000+ row query from zero after a
  late-stage failure was directly wasting money, not just time.
- Downstream systems expected complete result sets — partial data was worse than no data.
- The extraction window was limited by the reporting schedule; jobs couldn't just be made to run
  indefinitely longer.
- Any fix had to work within existing Airflow infrastructure rather than introducing a parallel
  orchestration system.

## Approach

I moved from one large synchronous pull to a chunked extraction pattern: queries are paginated
into bounded row ranges, each chunk is extracted independently, written directly to S3, and
tracked with its own success/failure state. Airflow retries only the failed chunk, not the whole
query. Once all chunks land in S3, a lightweight finalize step assembles and hands off the
complete result set downstream.

<div class="flow-diagram" role="img" aria-label="Extraction flow: Snowflake query is split into row-range chunks, each chunk extracted independently to S3, then a finalize step assembles the complete result set for downstream consumers.">
  <svg viewBox="0 0 720 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g font-family="JetBrains Mono, monospace" font-size="13">
      <rect x="10" y="55" width="110" height="50" rx="6" class="fd-box" />
      <text x="65" y="85" text-anchor="middle" class="fd-text">Snowflake</text>
      <path d="M120 80 H165" class="fd-arrow" marker-end="url(#arrow)" />
      <rect x="170" y="10" width="110" height="40" rx="6" class="fd-box fd-box-alt" />
      <text x="225" y="35" text-anchor="middle" class="fd-text">chunk 1</text>
      <rect x="170" y="60" width="110" height="40" rx="6" class="fd-box fd-box-alt" />
      <text x="225" y="85" text-anchor="middle" class="fd-text">chunk 2</text>
      <rect x="170" y="110" width="110" height="40" rx="6" class="fd-box fd-box-alt" />
      <text x="225" y="135" text-anchor="middle" class="fd-text">chunk n</text>
      <path d="M280 30 H340 M280 80 H340 M280 130 H340" class="fd-arrow" marker-end="url(#arrow)" />
      <rect x="345" y="55" width="90" height="50" rx="6" class="fd-box" />
      <text x="390" y="85" text-anchor="middle" class="fd-text">S3</text>
      <path d="M435 80 H480" class="fd-arrow" marker-end="url(#arrow)" />
      <rect x="485" y="55" width="110" height="50" rx="6" class="fd-box" />
      <text x="540" y="85" text-anchor="middle" class="fd-text">finalize</text>
      <path d="M595 80 H640" class="fd-arrow" marker-end="url(#arrow)" />
      <rect x="645" y="55" width="65" height="50" rx="6" class="fd-box" />
      <text x="677" y="85" text-anchor="middle" class="fd-text">out</text>
    </g>
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0 0 L8 4 L0 8 Z" class="fd-arrowhead" />
      </marker>
    </defs>
  </svg>
</div>

## Technical decisions

- **Why chunked results were necessary.** Bounding each unit of work to a fixed row range meant
  a failure only cost the compute for one chunk, not the whole query — a direct fix for the
  "pay twice for the same failed query" problem.
- **Why S3 was introduced.** Landing chunks in S3 as they complete decouples extraction from
  hand-off: downstream consumers don't need to be up or fast at the exact moment a chunk
  finishes, and a failed finalize step doesn't mean re-extracting anything.
- **Why a per-chunk retry strategy, not a per-query one.** Airflow's native task retries were
  repointed at the chunk level, so a transient Snowflake connection drop only replays a bounded,
  cheap unit of work instead of the entire extraction.

## Challenges

The subtlest bug was in chunk boundary correctness — off-by-one ranges either dropped or
duplicated rows at chunk edges under concurrent extraction. That pushed the chunking key to a
stable, indexed column with explicit inclusive/exclusive bounds per chunk, verified by a
row-count reconciliation step after finalize rather than trusting the pagination logic blindly.

## Results

- Increased successful execution of high-volume (10,000+ row) queries by 45%.
- Reduced recurring extraction failures by 60%.
- Reduced overall extraction cost by 60%, mostly by eliminating wasted re-computation on retries.

## Lessons

Most "large query" problems are actually "unbounded unit of work" problems in disguise. Once
extraction was chunked, failure handling, cost, and retries all got simpler at the same time —
they were symptoms of the same root cause, not three separate problems to solve independently.
A future version would push chunk-level backpressure further upstream, so Snowflake warehouse
sizing could react to extraction load automatically instead of being set statically.
