---
layout: splash
title: Research
permalink: /research/
hidden: true
feature_row:
  - alt: "Algorithm design"
    title: Algorithm Design
    excerpt: "Designing multi-objective algorithms that keep making progress on rugged, deceptive, or highly constrained search spaces."
    url: "/algorithm-design/"
    btn_class: "btn--primary btn--large"
    btn_label: "Learn more"
  - alt: "Algorithm analysis"
    title: Analysing Algorithms
    excerpt: "Understanding when evolutionary algorithms, local search, archives, and update rules work well for different problem classes."
    url: "/algorithm-analysis/"
    btn_class: "btn--primary btn--large"
    btn_label: "Learn more"
  - alt: "Theoretical studies"
    title: Theoretical Studies
    excerpt: "Runtime analysis and benchmark design that explain the fundamental behaviour of multi-objective optimisation algorithms."
    url: "/theoretical-studies/"
    btn_class: "btn--primary btn--large"
    btn_label: "Learn more"
  - alt: "Problem landscape visualisation"
    title: Landscape Visualisation
    excerpt: "Visualisation methods for multi-objective fitness landscapes, designed to make problem structure easier to inspect and explain."
    url: "/problem-landscape/"
    btn_class: "btn--primary btn--large"
    btn_label: "Learn more"
  - image_path: /assets/images/MOOsmall.png
  - alt: "Other research interests"
    title: Other Research Interests
    excerpt: "Early-stage interests include artificial life, multi-agent systems, science-technology-society questions, and procedural content generation."
    url: "/research/#future-directions"
    btn_class: "btn--primary btn--large"
    btn_label: "Learn more"
---

New to multi-objective optimisation? Start with the
[**Beginner's Guide**](/MOO/).
&nbsp;&nbsp;From an **industry or applied background**? See
[**Industry**](/industry/) for application scenarios.
{: .notice--info}

# Research Overview

My research interests principally lie in **AI, complex systems, and
optimisation**.

**AI runs on trade-offs.** Almost every interesting decision in modern AI is a
balancing act between goals that pull against each other. Optimising a large
language model means trading *helpfulness against harmlessness*,
*informativeness against conciseness*, *creativity against reliability*.
Building an agentic system means choosing *which model fills which role*,
trading *capability against latency and cost*.

These are **multi-objective optimisation** problems. They rarely have a single
best answer, but a *set* of best trade-offs — a Pareto front — and the real task
is to find that set and let a decision-maker choose with the full picture in
view, or switch the decision when circumstances change. As LLM and agentic
systems take on more open-ended, higher-stakes tasks, the trade-off structure
underneath them stops being a convenience to paper over and becomes something
we have to understand directly.

That is the space my research works in — **multi-objective combinatorial optimisation** — problems with discrete, structured search spaces. This is the hard end of the field, and also the shape of many AI problems: assembling an
agent team, selecting a feature set, configuring a system. The search spaces
are rugged and deceptive, exact solutions are out of reach, and the algorithm
we choose genuinely changes the outcome.

The honest state of practice is that people reach for a famous algorithm —
NSGA-II, MOEA/D — and hope. My work pushes back on that by replacing
guesswork with understanding: when a problem is hard, **which algorithm should
we trust, and why?**

{% include feature_row %}


## How the pieces connect

Multi-objective optimisation is often presented through the Pareto front — the
visible set of trade-off solutions. But the front is only the *output* of a
deeper search process, and that process is what my work tries to understand:
how an algorithm explores a landscape, when it should keep or discard a
solution, how it uses memory, and what makes a problem easy or hard.

This is why the empirical and theoretical sides of my work feed each other.
**Empirical studies** surface behaviours worth explaining. **Theoretical
analysis** isolates the mechanism and proves when it holds. **Benchmark
design** makes those formal settings more realistic. **Visualisation** makes
problem structure concrete enough to inspect, teach, and debug. Together they
turn algorithm choice from a black-box race into a diagnosis.

## Why this matters now

These findings were established on classic combinatorial problems — travelling
salesman, knapsack, assignment, NK-landscapes. But the findings themselves are
about *search*: how exploration and memory should be balanced when a problem
is rugged, deceptive, and multi-objective. That description fits a growing
share of AI engineering.

The connection is becoming concrete. Neural combinatorial optimisation —
learning a model to solve combinatorial problems directly — is now a serious
alternative to evolutionary search, and the same questions apply to it: what
does its search landscape look like, where does it get stuck, and when does a
learned solver actually beat a classical one? Understanding search behaviour
is not a niche concern of evolutionary computation. It is the groundwork for
reasoning rigorously about the multi-objective systems — classical, learned,
and agentic — that the AI field is now building.

For the published record, see the [Publication](/publication/) page.

## What we are learning about search

A recurring theme across these projects is that the field's *reflexes* — the
things everyone does by default — are often wrong on hard combinatorial
problems. Three reflexes, three corrections.

**Reflex: elaborate algorithms beat simple ones.** A very simple algorithm
with no crossover, no diversity mechanism, and no clever selection can match
or beat NSGA-II and other well-established MOEAs on a range of combinatorial
problems. The reason is not magic: a sophisticated component added for one
kind of landscape can quietly sabotage the search on another. Crossover, in
particular, speeds search up on smooth landscapes but actively hurts on rugged
ones. The useful conclusion is not "simple is always better" — it is that *a
mechanism we understand beats a mechanism we merely assume.*

That lesson cuts both ways. Pushed to large problems — thousands of variables
— the same simple algorithm begins to *lose*: its convergence slows markedly
next to algorithms that use crossover. Simplicity is not a free lunch; it is a
trade-off whose terms depend on problem size and structure. Knowing *where*
the trade-off turns is the actual contribution.

**Reflex: always keep your best solutions.** Almost every modern MOEA is
elitist — it protects the best solutions found so far. That instinct is sound
early in a search, but once the search stalls in a local optimum, those same
best solutions stop producing progress. Solutions usually dismissed as
inferior — dominated solutions — can act as *bridges* out of the trap. Letting
go of strict elitism, or deliberately storing and reusing dominated solutions,
makes a search markedly better on hard, deceptive problems.

**Reflex: one population does everything.** A single population is usually
asked to do two conflicting jobs at once: exploit the good solutions it has,
and explore toward new regions. The best solutions for exploitation are often
the worst for exploration, and vice versa. Splitting these jobs across two
populations — one guarding quality, one kept deliberately diverse — can deliver
large, provable speed-ups over forcing one population to compromise.

A related thread is *how* a search moves locally. Scanning a neighbourhood
systematically feels efficient — you never revisit an option. Yet sampling
neighbours at random, with all its apparent redundancy, finds good solutions
faster, because of how useful moves are distributed during a search.

## Future Directions

I am extending this work along two lines. The first is **multi-objective
neural combinatorial optimisation** — bringing the search-behaviour and
fitness-landscape lens to learned solvers, and asking how they compare with
evolutionary algorithms. The second is **multi-agent systems** and the
multi-objective trade-offs inside LLM-based agent teams.

I also have broader interests in **artificial life**, the intersection of
**science, technology, society, and environment (STSE)**, and
**multi-objective procedural content generation**. These share the same core
interest: understanding complex systems that must act under multiple,
interacting criteria.

---
