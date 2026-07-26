---
title: "Kafka processing & distributed scheduling"
slug: "kafka-scheduling"
oneLiner: "Cutting consumer lag by rethinking partitioning and batching, then reusing the same ideas for distributed scheduling and caching."
role: "Backend engineer, streaming & infra"
stack: ["Kafka", "Go", "Redis", "Kubernetes"]
result: "Consumer lag -78%"
order: 3
---

## Overview

A Kafka-based processing pipeline was falling steadily behind its producers. Consumer lag grew
during peak hours and never fully recovered during quiet ones, which meant downstream systems
were acting on stale data by the time they saw it.

## Context

The pipeline consumed events feeding both real-time features and batch aggregation. Lag wasn't
just a performance number — it directly delayed anything downstream that depended on "recent"
data, and it kept growing week over week as event volume increased.

## Problem

Consumers were processing messages one at a time, synchronously, with partitioning that didn't
match the actual hot keys in the data. A handful of partitions carried disproportionate load,
so adding more consumer instances didn't help — Kafka can't parallelize within a single
partition, and that's exactly where the backlog was concentrated.

## Constraints

- Message ordering had to be preserved per key — any fix had to work within Kafka's
  per-partition ordering guarantee, not around it.
- The pipeline couldn't tolerate downtime for a repartitioning migration; changes had to roll out
  incrementally against live traffic.
- Consumers ran in Kubernetes with modest, cost-conscious resource limits — the fix needed to be
  about efficiency, not just throwing more pods at the problem.

## Approach

Two changes did most of the work: repartitioning by a key that actually distributed load evenly
(instead of one that happened to be convenient upstream), and moving from per-message synchronous
processing to batched processing with bounded concurrency per partition — parallel *across*
partitions, still strictly ordered *within* each one.

<div class="flow-diagram" role="img" aria-label="Kafka topic with multiple partitions, each consumed by an independent worker processing batches with bounded concurrency, feeding a shared distributed cache used by the scheduler.">
  <svg viewBox="0 0 720 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g font-family="JetBrains Mono, monospace" font-size="13">
      <rect x="10" y="10" width="120" height="34" rx="6" class="fd-box" />
      <text x="70" y="32" text-anchor="middle" class="fd-text">partition 0</text>
      <rect x="10" y="68" width="120" height="34" rx="6" class="fd-box" />
      <text x="70" y="90" text-anchor="middle" class="fd-text">partition 1</text>
      <rect x="10" y="126" width="120" height="34" rx="6" class="fd-box" />
      <text x="70" y="148" text-anchor="middle" class="fd-text">partition n</text>
      <path d="M130 27 H190 M130 85 H190 M130 143 H190" class="fd-arrow" marker-end="url(#arrow2)" />
      <rect x="195" y="10" width="120" height="34" rx="6" class="fd-box fd-box-alt" />
      <text x="255" y="32" text-anchor="middle" class="fd-text">worker</text>
      <rect x="195" y="68" width="120" height="34" rx="6" class="fd-box fd-box-alt" />
      <text x="255" y="90" text-anchor="middle" class="fd-text">worker</text>
      <rect x="195" y="126" width="120" height="34" rx="6" class="fd-box fd-box-alt" />
      <text x="255" y="148" text-anchor="middle" class="fd-text">worker</text>
      <path d="M315 27 H370 M315 85 Q360 85 370 85 M315 143 Q360 143 370 85" class="fd-arrow" marker-end="url(#arrow2)" />
      <rect x="375" y="68" width="120" height="34" rx="6" class="fd-box" />
      <text x="435" y="90" text-anchor="middle" class="fd-text">Redis cache</text>
      <path d="M495 85 H555" class="fd-arrow" marker-end="url(#arrow2)" />
      <rect x="560" y="68" width="150" height="34" rx="6" class="fd-box" />
      <text x="635" y="90" text-anchor="middle" class="fd-text">scheduler</text>
    </g>
    <defs>
      <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0 0 L8 4 L0 8 Z" class="fd-arrowhead" />
      </marker>
    </defs>
  </svg>
</div>

The same distributed cache that consumers used to deduplicate and checkpoint progress turned out
to be reusable infrastructure for a separate, unrelated problem: coordinating a distributed
scheduler across multiple nodes without a single point of failure.

## Technical decisions

- **Why repartitioning, not just more consumers.** Ordering per key meant throughput was bound
  by the partition holding the hottest key. Adding consumers only helps if load is actually
  spread across partitions — so fixing the key distribution came before anything else.
- **Why bounded concurrency per partition, not full parallelism.** Processing fully in parallel
  within a partition would have broken ordering guarantees the downstream systems depended on;
  bounded concurrency across *partitions*, strictly sequential *within* one, kept correctness
  intact while still using available capacity.
- **Why a distributed cache, not a local one.** Consumers and the scheduler both needed a
  consistent view of processing state across pods that could be rescheduled or scaled at any
  time — a local, in-process cache would have meant every restart lost state that other
  components depended on being correct.

## Challenges

Repartitioning a live topic without downtime meant running old and new partitioning schemes side
by side during a transition window, with careful attention to not double-processing messages
that existed in both. The distributed cache also introduced its own failure mode early on: a
thundering-herd of cache misses right after a scale-up event, solved with a short jittered TTL
and request coalescing rather than a cache redesign.

## Results

- Reduced Kafka consumer lag by 78%.
- Improved infrastructure efficiency broadly by reusing the same distributed caching and
  scheduling primitives across both the streaming pipeline and the scheduler, instead of building
  bespoke coordination for each.

## Lessons

The Kafka fix and the scheduling fix turned out to be the same fix applied twice: identify what
actually needs to be ordered or coordinated, and build the smallest shared primitive that
guarantees it — then reuse that primitive instead of re-solving coordination per system. Chasing
throughput by adding compute is usually a symptom of not having found that primitive yet.
