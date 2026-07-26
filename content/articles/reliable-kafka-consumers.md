---
title: "Designing reliable Kafka consumers"
publishDate: 2025-09-10
description: "Ordering, idempotency, and backpressure: the three things that actually determine whether a consumer is reliable."
slug: "reliable-kafka-consumers"
featured: false
topic: "Distributed Systems"
---

Most Kafka outages I've debugged weren't Kafka's fault. They were consumers written as if
messages arrive once, in order, and get processed instantly — and then production happily
violates all three assumptions at once.

## Ordering is a property of partitions, not topics

Kafka only guarantees ordering *within a partition*. If your consumer logic assumes messages for
a given key arrive in order across the whole topic, you've already introduced a bug — it just
hasn't shown up yet, because your test topic probably has one partition.

The fix isn't clever code, it's picking a partition key that actually matches what needs to stay
ordered (usually an entity ID), and being honest that anything without that key has no ordering
guarantee at all. If two different keys need relative ordering with each other, that's a sign
they shouldn't be two keys.

## Idempotency is not optional

At-least-once delivery means your consumer *will* see the same message twice eventually —
after a rebalance, a retry, a consumer restart mid-batch. If processing a message twice changes
the outcome, that's the actual bug, not the redelivery.

The pattern that's worked best for me: track a dedup key (message ID, or a natural key + offset)
somewhere the consumer checks *before* doing anything with side effects, not after. "Process then
record" has a gap where a crash between the two steps causes exactly the duplicate-processing bug
you were trying to avoid.

```python
def handle(message):
    if already_processed(message.key):
        return
    apply_side_effects(message)
    mark_processed(message.key)  # after, not before
```

Even this has a race under concurrent processing of the same key — which is why the dedup check
and the side effect usually need to be in the same transaction, or the key needs partition-level
serialization so only one worker ever touches it at a time.

## Backpressure is where lag actually comes from

Lag rarely comes from Kafka being slow. It comes from a downstream dependency — a database, an
external API, another queue — being slower than the rate messages arrive. A consumer that keeps
pulling messages faster than it can process them just moves the backlog from Kafka's log into
your own process's memory, which is worse, not better.

Bounded concurrency per partition (a worker pool sized to what the downstream can actually
sustain) keeps the backlog visible as consumer lag — a metric you can alert on — instead of
invisible as growing heap usage right up until the pod gets OOM-killed.

## The consumer that's actually reliable

...doesn't try to be clever. It picks a partition key that matches the real ordering requirement,
treats every message as possibly-duplicate, and processes at a rate its downstream can sustain
rather than the rate Kafka can deliver. Everything else — retries, dead-letter queues, monitoring
— is built on top of those three decisions being right first.
