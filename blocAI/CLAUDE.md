# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Project Is

This is a **strategy and AI product development workspace** for **The Bloc** (an IW/IPG integrated pharma/healthcare marketing agency). There is no application codebase here — the repo contains strategy documents and validation plans for a multi-agent AI toolset the agency is building internally.

**The core mission**: Transform The Bloc's business model using AI across three pillars, with the SETS Engine as the flagship product.

---

## Key Documents

| File | What It Contains |
|---|---|
| `AI Evolution Strategy - IW (2).pptx` | Master strategy deck — three pillars, phase timeline, current workflow AI use cases, efficiency metrics |
| `AI Evolution Strategy - IW (1).pptx` | Earlier version of the strategy deck |
| `AI Evolution Strategy - IW.pptx` | Original version |
| `Validation Plan SETS Engine_20260408.xlsx` | Test plan for the SETS Engine — all test categories, sample sizes, pass criteria |

---

## Key Products & Terminology

### SETS Engine (Pillar 1 — PowerBe-Comms)
The flagship AI product. A **6-agent scoring pipeline** that evaluates pharma/healthcare marketing assets. Currently has a working version but requires validation against human expert benchmarks.

**Scoring dimensions**: Accuracy, Precision, Robustness, Range, Specificity

**What it scores**: Marketing assets across dimensions like CTA presence, copy volume, imagery type, regulatory compliance, messaging quality.

**KPI**: Differentiation (product/IP positioning for The Bloc)

### Strata (Pillar 2 — Enable Precision)
A client-facing AI platform for **segmentation, synthetic personas, and audience insights**. Separate product from SETS. Currently in planning/early development.

**KPI**: Revenue (new client acquisition vehicle)

### Drive Operations (Pillar 3)
AI-facilitated internal workflows — meeting notes, burn reports, timeline optimization, brief assessment. Not a product; efficiency tooling.

**KPI**: Value (internal time/cost savings)

---

## SETS Engine Validation Plan

The `Validation Plan SETS Engine_20260408.xlsx` defines the full test matrix. Tests are grouped by dimension:

| Dimension | Tests | Focus |
|---|---|---|
| **Precision (P1-P3)** | Same Asset Repeat, Pass Consistency, Dimension Stability | Score variance / repeatability |
| **Accuracy (A1-A4)** | Expert Agreement, Category Alignment, Dimension Accuracy, Expert Recommendation | Alignment with human experts |
| **Range (R1-R4)** | Benchmark Ladder, Forced Contrast, Distribution, Rank Ordering | Scale differentiation (not clustering in middle) |
| **Robustness (B1-B5)** | Metadata Variation, Noise Injection, Edge Case, Formatting Variation, Technical Stability | Stability under input variation |
| **Specificity (S1-S4)** | Single-Factor Manipulation, Rule Trigger, False Positive/Negative, Recommendation Relevance | Correct identification of issues |

**Sample size requirements**: 500–1,000 assets needed for full validation; 30–100 per individual test.

**Validation next steps** (from the plan):
1. Implement a database
2. Curate and collect assets + human expert assessments
3. Prepare test sets
4. Run tests (some automated, especially Precision tests)
5. Review results with team
6. Adjust scoring weights/logic
7. Re-test

**Current status**: Working version exists, initial results promising. Human benchmarking not yet established — no method to calculate a human expert score for comparison yet.

---

## Phase Timeline (2026)

| Phase | Timing | Focus |
|---|---|---|
| Phase 1 | Mar–May 2026 | Assess gaps, ID capabilities and cost structures, SETS validation outline |
| Phase 2 | Jun–Aug 2026 | Pilot SETS internally/externally, launch Strata tools with clients, ID Phase 2 projects |
| Phase 3 | Sep 2026+ | Scale, train offices, activate sales plans, productize |

---

## Known Efficiency Benchmarks (for reference)

From the workflow slides — documented AI efficiency gains at The Bloc:
- **Project Kickoff** (brief review, timeline optimization, estimate validation): 7 hrs → 3.5 hrs (50%)
- **Website Prototyping** (vibe coding, animation, functional components): 50 hrs → 23 hrs (54%)
- **Website Animation** (Figma + Make): 8 hrs → 4 hrs (50%), saves ~$800 OOP
