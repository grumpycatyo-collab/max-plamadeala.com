---
title: "Serving ML models in Go with ONNX Runtime"
publishDate: 2025-11-20
description: "Why we moved model inference out of Python, and what actually got faster."
slug: "onnx-go-model-serving"
featured: false
topic: "Applied AI"
---

The model was trained in Python, like almost everything is. The service that needed to call it
under 50ms, at high concurrency, alongside a bunch of other Go services, was not going to be
Python — at least not without a fight we didn't need to have.

## The usual options, and why they weren't it

The obvious path is a Python inference service behind an HTTP or gRPC boundary, called from Go
like any other dependency. It works, and for a lot of workloads it's the right call — don't
rewrite what isn't the bottleneck.

It stopped being the right call once inference was on the hot path of a request that was already
budget-constrained. Every hop is latency and another thing that can be down; a separate Python
service is a separate deploy, a separate scaling policy, a separate thing paging someone at 3am.

## ONNX as the boundary

Exporting the trained model to ONNX format turns "run this PyTorch/sklearn model" into "run this
portable computation graph," which has runtimes in more languages than just Python — including a
solid Go binding for ONNX Runtime.

That meant the model could be loaded and called directly inside the existing Go service — no
network hop, no second deploy, no separate service to keep alive. Training stayed in Python,
where it belongs; serving moved to where the request was already living.

```go
session, err := onnxruntime.NewAdvancedSession(
    "model.onnx",
    []string{"input"}, []string{"output"},
    []onnxruntime.Value{inputTensor},
    []onnxruntime.Value{outputTensor},
)
```

## What actually got better

- **Latency**: no network round-trip to a separate inference service, and no Python interpreter
  overhead on the request path.
- **Operational surface**: one service to deploy, scale, and monitor instead of two, with one
  set of health checks and one set of resource limits to reason about.
- **Failure modes got simpler**: "the model call failed" is now a function call returning an
  error, not a network request that can time out, get rate-limited, or hit a cold-started pod.

## What it cost

ONNX export isn't free — some preprocessing that lived comfortably in a Python function (custom
tokenization, a slightly unusual normalization step) had to be pushed into the graph itself or
reimplemented in Go, since the ONNX boundary only carries the model's computation, not arbitrary
Python code around it. That's the real tradeoff: you get to skip the network hop, but you inherit
the discipline of keeping preprocessing inside the exportable graph, or duplicating it carefully
on both sides.

## Where this is and isn't worth it

This pattern earns its complexity when inference is genuinely on a latency-sensitive path inside
a service that isn't already Python, and when the model's shape is stable enough that ONNX export
isn't a moving target. For anything exploratory, or for models that are still changing shape
weekly, a Python service behind a boundary is still the faster path to shipping — optimize the
serving path once the model, not the architecture, is the thing worth stabilizing.
