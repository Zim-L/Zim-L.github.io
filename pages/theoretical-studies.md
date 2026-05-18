---
title: "Theoretical Studies"
layout: single
permalink: /theoretical-studies/
classes: wide
author_profile: true
toc: true
toc_label: "On this page"
toc_sticky: true
---

**In one line:** I use runtime analysis and carefully designed benchmarks to
explain *why* multi-objective algorithms behave the way they do — turning
empirical observations into design principles.
{: .notice--info}

Theory here is not theory for its own sake. An experiment can show that one
configuration beats another; it rarely tells you *which mechanism* caused the
difference. Runtime analysis can — and that is what makes empirical findings
transferable rather than anecdotal.

## Why theory matters here

A multi-objective optimiser is a bundle of interacting parts: selection,
mutation, crossover, population update, archiving, diversity preservation,
stopping rules. When one configuration outperforms another, the cause is rarely
obvious from experiments alone.

Runtime analysis isolates these parts. It can show, for instance, when an
archive changes the expected time to reach the Pareto front, when randomness in
population update helps escape a local optimum, or when a local search wastes
its evaluations in the wrong corner of a neighbourhood.

## Pseudo-Boolean benchmark foundations

Much of the theory of multi-objective evolutionary algorithms is built on
pseudo-Boolean functions. They are mathematically convenient — but many classic
examples have very artificial structure: symmetric objectives, linear Pareto
fronts, uniform difficulty, sometimes even *every* search point being Pareto
optimal. A theory tested only on these may not say much about real problems.

In [FOGA 2025](/assets/files/FOGA25_Pseudo_Boolean.pdf), we reviewed these
features and their consequences, then proposed new pseudo-Boolean functions with
richer structure — heterogeneous objectives, local optima, and nonlinear Pareto
fronts — built by composing classical single-objective functions such as
LeadingOnes, Jump, and RoyalRoad.

The purpose is to strengthen the bridge between formal runtime analysis and the
kinds of structure that actually appear in practical optimisation.

## The role of dominated solutions

Conventional wisdom in MOEAs is to favour non-dominated — "best so far" —
solutions. Early in a search, that is sound: it drives progress quickly. But
once a population stagnates in a local optimum, repeatedly exploiting those same
non-dominated solutions stops producing anything new.

Dominated solutions tell a different story. Often discarded as second-rate, they
can act as **bridge solutions** — stepping stones that lead a search out of one
local optimum and toward another. This work shows empirically that during
stagnation it is the dominated fronts, not the first front, that generate
promising new solutions, and proposes a simple mechanism: store a diverse set of
dominated solutions and reintroduce them when the population stalls. Applied to
several standard MOEAs, this measurably improves their performance.

## Theory for algorithm mechanisms

Several of my recent works use formal analysis to explain a specific mechanism:

- **Stochastic population update with archives.** Randomly preserving weaker
  solutions aids exploration — but an archive is needed to keep good solutions
  from being lost.
- **Archive reuse.** An archive can do more than store non-dominated solutions;
  reusing them as search material provably improves expected running time.
- **Decoupling exploration and exploitation.** A single population is usually
  asked to do two opposing jobs at once: exploit its best solutions and explore
  new regions. The best solutions for one job are often the worst for the
  other. Splitting the work across two populations — one keeping only the best
  solutions, one governed purely by an aging rule that ignores quality — can
  provably reduce expected running time on hard multimodal problems, by large
  and sometimes exponential factors, compared with forcing one population to
  compromise.
- **Random local search.** Random neighbourhood sampling can beat systematic
  scanning, because of how useful neighbours are distributed during the search.

Together, these results support a more flexible view of algorithm design: the
best mechanism is not always the one that sounds most greedy, most systematic,
or most conservative.

## Link to empirical work

The theoretical and empirical strands of my research are connected on purpose.
Empirical work surfaces patterns worth explaining; theory finds the minimal
setting where those patterns can be *proved*; benchmark design makes those
settings more realistic; and visualisation communicates the problem structure
behind the analysis. No single strand is enough on its own.

## Selected publications

For the full published record, see the [Publication](/publication/) page.

- Z. Liang, M. Li. **On the Problem Characteristics of Multi-objective
  Pseudo-Boolean Functions in Runtime Analysis.** FOGA, 2025.
  [[PDF]](/assets/files/FOGA25_Pseudo_Boolean.pdf)
  [[DOI]](https://doi.org/10.1145/3729878.3746700)
- S. Ren, Z. Liang, M. Li, C. Qian. **A Theoretical Perspective on Why
  Stochastic Population Update Needs an Archive in Evolutionary
  Multi-objective Optimization.** IJCAI, 2025.
  [[PDF]](/assets/files/IJCAI25_SPU_Archive.pdf)
- S. Ren, Z. Liang, M. Li, C. Qian. **Not Just for Archiving: Provable
  Benefits of Reusing the Archive in Evolutionary Multi-objective
  Optimization.** AAAI, 2026.
  [[PDF]](/assets/files/AAAI26_Archive_Reuse.pdf)
  [[Code]](https://github.com/Zim-L/AAAI26ArchiveReuse)
- Z. Liang, M. Li. **Random is Faster than Systematic in Multi-Objective
  Local Search.** AAAI, 2026.
  [[PDF]](/assets/files/AAAI26_Random_MOLS.pdf)
  [[Code]](https://github.com/Zim-L/AAAI26LS)
