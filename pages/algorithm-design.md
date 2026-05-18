---
title: "Algorithm Design"
layout: single
permalink: /algorithm-design/
classes: wide
author_profile: true
toc: true
toc_label: "On this page"
toc_sticky: true
---

**In one line:** I study how a multi-objective optimiser should keep,
discard, revisit, and generate solutions when the search space is hard — the
setting behind everything from factory scheduling to assembling an LLM agent
team — and I find that the simple choice is often the right one.
{: .notice--info}

Most multi-objective evolutionary algorithms are built on a sensible instinct:
*protect the best solutions you have found so far.* That instinct is usually
right. But it is not the whole story. On a rugged or deceptive landscape, strong
preservation can trap a search — it keeps exploiting a region that looks good
locally but leads nowhere.

This line of work asks how to keep the *useful* parts of elitism and archiving
while leaving a search enough freedom to escape such traps.

## The design question

In a multi-objective problem, an algorithm maintains a population or an archive
of trade-off solutions. Every generation forces one question:

> Which solutions should be allowed to influence the future of the search?

It shows up in several concrete forms:

- Should the old population always survive if it is currently good?
- Should weaker solutions sometimes survive, because they may open the door to
  better regions later?
- Should an archive only *record* solutions, or actively *generate* new search
  steps from them?
- In local search, should a neighbourhood be scanned in order, or sampled at
  random?

I approach these through both experiments and formal proof.

## Non-elitist MOEAs

Elitism — selecting the next population from both old and new solutions, so good
ones are never lost — has been a near-universal default since the late 1990s. In
[GECCO 2023](/assets/files/GECCO23_NE_MOEA.pdf), we asked what happens if you
deliberately remove it.

The resulting non-elitist MOEA discards the old population entirely and lets
selection pressure come from mating selection alone. The point was not that
elitism is bad, but that the design space is wider than the standard template
admits. On several rugged combinatorial problems, this simple non-elitist idea
held its own against established elitist algorithms such as NSGA-II, SMS-EMOA,
and NSGA-III.

The takeaway: **preservation and progress are not the same thing.** A population
can hold high-quality solutions while being badly positioned for the next move.

## Stochastic update with archives

Stochastic population update lets some weaker solutions survive at random. This
can help an algorithm jump out of a local optimum — but it also risks losing
genuinely good solutions.

In [IJCAI 2025](/assets/files/IJCAI25_SPU_Archive.pdf), we studied this tension
formally. The result explains *why* an archive matters when update is
stochastic: the archive protects the best solutions found so far, while the
stochastic population provides room to explore. With this pairing, a small
population can be enough, and the expected running time can improve sharply.

The principle is simple: **randomness is useful, but it should be paired with
memory.**

## Archive reuse

An archive is usually treated as a passive record of the non-dominated solutions
seen so far. In [AAAI 2026](/assets/files/AAAI26_Archive_Reuse.pdf), we gave it
an active role: feeding archived solutions back into offspring generation.

The motivation is intuitive. A small population may have to delete a promising
solution simply because it cannot hold everything. If the archive only *stores*
that solution, the algorithm remembers it but never uses it again. If the
archive can be *reused*, the search can return to that promising region.

The analysis shows this reuse can deliver polynomial speed-ups on benchmark
problems — and can even beat the alternative of simply using a larger
population.

## Random local search

Local search feels most efficient when it scans a neighbourhood systematically:
inspect each neighbour once, never revisit, stop on a condition. In
multi-objective local search, that intuition can fail.

In [AAAI 2026](/assets/files/AAAI26_Random_MOLS.pdf), we showed that random
neighbourhood sampling can be *faster* than systematic exploration across a
range of multi-objective problems. The reason is the distribution of "good
neighbours" during the search: when useful moves are spread in a way that
rewards repeated random trials, the bookkeeping overhead of systematic scanning
outweighs its apparent tidiness.

This is a good example of the style of work I care about: take a familiar
assumption, find exactly where it breaks, then explain the mechanism behind the
result.

## Decoupling exploration and exploitation

The sections above keep returning to one tension: a population must both
*exploit* the good solutions it has and *explore* toward new regions, and the
solutions best suited to one job are often the worst for the other. The usual
response is to tune a single population to compromise between the two.

A cleaner answer is to stop compromising. A dual-population design assigns
each role its own population: one keeps only the best (non-dominated)
solutions for exploitation, while the other ignores quality entirely and is
governed by a simple aging rule, so that recently generated solutions —
including poor ones with exploratory value — survive long enough to be useful.
A single probability decides which population a parent is drawn from, which
makes the intensity of exploration something you set directly rather than
something you hope emerges from one population's dynamics. This decoupling can
yield large, provably faster search on hard multimodal problems.

## Where the design work goes next

The minimal-algorithm thread continues to open questions: how to extend a
simple optimiser such as SEMO to variable-length representations, and how to
make its search steps adaptive rather than fixed. These are ongoing and will
appear here as the work matures.

## Selected publications

For the full published record, see the [Publication](/publication/) page.

- Z. Liang, M. Li. **Random is Faster than Systematic in Multi-Objective
  Local Search.** AAAI, 2026.
  [[PDF]](/assets/files/AAAI26_Random_MOLS.pdf)
  [[Code]](https://github.com/Zim-L/AAAI26LS)
- S. Ren, Z. Liang, M. Li, C. Qian. **Not Just for Archiving: Provable
  Benefits of Reusing the Archive in Evolutionary Multi-objective
  Optimization.** AAAI, 2026.
  [[PDF]](/assets/files/AAAI26_Archive_Reuse.pdf)
  [[Code]](https://github.com/Zim-L/AAAI26ArchiveReuse)
- S. Ren, Z. Liang, M. Li, C. Qian. **A Theoretical Perspective on Why
  Stochastic Population Update Needs an Archive in Evolutionary
  Multi-objective Optimization.** IJCAI, 2025.
  [[PDF]](/assets/files/IJCAI25_SPU_Archive.pdf)
- Z. Liang, M. Li, P. K. Lehre. **Non-elitist Evolutionary
  Multi-objective Optimisation: Proof-of-principle Results.** GECCO Companion,
  2023.
  [[PDF]](/assets/files/GECCO23_NE_MOEA.pdf)
  [[DOI]](https://doi.org/10.1145/3583133.3590646)
