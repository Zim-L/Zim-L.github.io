---
title: "Analysing Algorithms"
layout: single
permalink: /algorithm-analysis/
classes: wide
author_profile: true
toc: true
toc_label: "On this page"
toc_sticky: true
---

**In one line:** I study *when* a multi-objective optimiser fits a problem — and
*when* a familiar design choice quietly becomes a liability.
{: .notice--info}

Multi-objective combinatorial optimisation is where this matters most. The
search space is discrete, and its structure can differ sharply from the smooth,
continuous benchmarks that many popular algorithms were tuned on. An algorithm
that shines on continuous problems may stumble here.

The aim of this work is not to crown one best algorithm. It is to understand the
*conditions* under which each search paradigm becomes effective — so that
algorithm choice becomes an informed decision rather than a habit.

## MOEAs versus local search

Multi-objective evolutionary algorithms (MOEAs) are usually the first tool
people reach for. Local search is a natural alternative on discrete problems,
since neighbourhoods are easy to define there. In
[GECCO 2024](/assets/files/MOEAs_vs_LS__Data_Fixed.pdf), we compared
well-known MOEAs against local search heuristics on several multi-objective
combinatorial problems.

The result was nuanced: different paradigms won under different problems,
instance settings, and computational budgets. The most striking observation was
the strong performance of **SEMO** — a minimal algorithm that sits, in effect,
between an evolutionary algorithm and randomised local search.

This suggests the boundary between algorithm families is not just a taxonomy.
It is itself a productive design space, and SEMO's success became a starting
point for much of my later work.

## How far does simplicity scale?

SEMO's strong showing came with a caveat: those comparisons used relatively
small problems. A natural question is whether a minimal algorithm keeps its
edge as problems grow — to hundreds or thousands of decision variables, the
regime where real combinatorial problems actually live.

It does not. Scaled up across diverse combinatorial problems, SEMO shows a
clear decline in convergence speed relative to NSGA-II, SMS-EMOA, and MOEA/D:
given a generous budget it still reaches a broad Pareto front, but it gets
there increasingly slowly as dimensionality rises. The main reason is the
absence of **crossover**. Adding crossover to SEMO substantially accelerates
convergence on large instances — notably, even crossover between two very
similar solutions helps, which is not the regime crossover is usually assumed
to need. But it is not a free win: with crossover, SEMO tends to lose
population diversity and spread solutions less evenly along the front.

The lesson sharpens the earlier one. Simplicity is not universally good or
bad; it is a trade-off whose terms shift with problem size. A component absent
by design (crossover) is exactly what a minimal algorithm needs once a problem
is large — and adding it back trades convergence speed against diversity. The
useful knowledge is *where* that trade-off turns.

## Archive truncation

Archives store the non-dominated solutions found during a search. Left
unmanaged, an archive can grow very large — but a decision-maker usually wants a
small, representative subset. So:

> When should the archive be truncated?

In [GECCO 2025](/assets/files/GECCO25_Archive_Truncation.pdf), we compared
truncating immediately, truncating in batches, and keeping an unbounded archive
to truncate only at the end. The natural intuition is that the unbounded archive
should win — it has the most information available. The experiments showed the
opposite when standard MOEA population-maintenance criteria are used:
**immediate truncation often performed best, and the unbounded archive often
performed worst.**

The lesson: *"keep everything, decide later"* is not automatically better. Large
archives need subset-selection methods designed for that job — not
population-maintenance rules borrowed out of context.

## Local search behaviour

Local search is often described as systematic: pick a solution, inspect its
neighbourhood, move when you find an improvement. My work on
[random versus systematic multi-objective local search](/assets/files/AAAI26_Random_MOLS.pdf)
shows this picture can mislead. Randomly sampling a single neighbour can be
faster — even though it may revisit neighbours — because the cost of systematic
scanning depends on how useful neighbours happen to be distributed.

This is why I treat algorithm comparison as a *behavioural* question. Counting
evaluations is useful; understanding *where* the useful evaluations occur is
often more revealing.

## Towards learned solvers

The same behavioural lens is now needed for a newer class of methods. Neural
combinatorial optimisation — training a model to construct solutions directly
— has become a serious alternative to evolutionary search on combinatorial
problems. But a learned solver is still a search process, and the same
questions apply: what does its search landscape look like, where does it get
stuck, and under which problem conditions does it actually outperform a
classical algorithm? Extending the comparison between paradigms to include
neural solvers, and analysing them through a fitness-landscape lens, is an
active direction of my current work.

## What I look for

Across these studies, I try to identify the problem and algorithm features that
actually predict performance:

- whether the problem is rugged, deceptive, constrained, or highly multimodal;
- whether a small population risks losing promising regions;
- whether an archive is acting as memory, as search material, or as final
  output;
- whether the computational budget favours broad exploration or local
  refinement;
- whether a method's success comes from its headline design principle, or from
  a smaller mechanism hidden inside it.

This kind of analysis turns algorithm selection from a black-box race into a
diagnosis of search behaviour.

## Selected publications

For the full published record, see the [Publication](/publication/) page.

- M. Li, X. Han, X. Chu, Z. Liang. **Empirical Comparison Between MOEAs and
  Local Search on Multi-objective Combinatorial Optimisation Problems.** GECCO,
  2024.
  [[PDF]](/assets/files/MOEAs_vs_LS__Data_Fixed.pdf)
  [[DOI]](https://doi.org/10.1145/3638529.3654077)
- Z. Cui, Z. Liang, L. M. Pang, H. Ishibuchi, M. Li. **When to Truncate
  the Archive? On the Effect of the Truncation Frequency in Multi-Objective
  Optimisation.** GECCO Companion, 2025.
  [[PDF]](/assets/files/GECCO25_Archive_Truncation.pdf)
  [[DOI]](https://doi.org/10.1145/3712255.3726715)
  [[arXiv]](https://doi.org/10.48550/arXiv.2504.01332)
- Z. Liang, M. Li. **Random is Faster than Systematic in Multi-Objective
  Local Search.** AAAI, 2026.
  [[PDF]](/assets/files/AAAI26_Random_MOLS.pdf)
  [[Code]](https://github.com/Zim-L/AAAI26LS)
